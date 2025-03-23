import { v4 as uuidv4 } from 'uuid';
import sequelize from '../../configs/database.js';
import CartRepository from '../repositories/CartRepository.js';
import OrderRepository from '../repositories/OrderRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';
import { generateOrderNumber } from '../../utils/generators.js';
import JobScheduler from '../../services/queue/scheduler.js'
import { ORDER, CART } from '../../services/queue/jobTypes.js';
import businessConfig from '../../configs/business.js';

class OrderService {
  async createOrder(userId, data, email) {
    logger.debug(`data inside createOrder: ${JSON.stringify(data, null, 2)}`);

    const transaction = await sequelize.transaction();
    
    try {
      logger.info(`Creating order for user: ${userId}`);
      
      // Retrieve user's cart
      const cart = await CartRepository.findByUserId(userId, transaction);
      if (!cart || cart.CartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      
      let totalAmount = 0;
      const orderItems = [];
      
      for (const cartItem of cart.CartItems) {
        if (cartItem.quantity > 0) {
        totalAmount += cartItem.price * cartItem.quantity;
        orderItems.push({
          ProductId: cartItem.ProductId,
          quantity: cartItem.quantity,
          price: cartItem.price
        });
        }
      }

      if (orderItems.length < 1) {
        throw new Error('No items found for order')
      }
      
      // Create order
      var order = await OrderRepository.create({
        id: uuidv4(),
        orderNumber: generateOrderNumber(), 
        UserId: userId,
        totalAmount,
        status: 'pending',
        OrderItems: orderItems,
        shippingAddress: data.shippingAddress,
      }, { transaction });
      
      // Cancel cart expiration since we create order
      await JobScheduler.cancelJob('cart', cart.jobId);
 
      // Clear cart after order creation
      await CartRepository.clearCart(cart.id, transaction);
      
      await this.handleOrderExpiration(order, transaction);
      
      await transaction.commit();
      logger.info(`Order created successfully: ${order.id}`);
      await JobScheduler.scheduleJob(`email:order-created`, {
        template: `order.orderCreated`,
        to: email,
        orderItems,
        totalAmount,
        subject: `Order ${order.orderNumber} is created`
      }, new Date());

      return order;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Order creation failed: ${error.message}`);
      throw error;
    }
  }
  
  async getUserOrders(userId, page = 1, limit = 10) {
    const orders = await OrderRepository.findByUserId(userId, page, limit);
    return orders;
  }

  async getOrderById(orderId, userId, role) {
    const order = await OrderRepository.findById(orderId);
    if (!order || (order.UserId !== userId) && role == "customer") {
      throw new NotFoundError('Order not found');
    }
    return order;
  }

  async updateOrderStatus(orderId, status) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    if (status === order.status) {
      throw new BadRequestError("Current status is the same");
    }
    
    // Handle expiration job if exists
    if (order.expirationJob) {
      const jobStatus = await JobScheduler.getJobStatus(order.expirationJob, "order");
      if (jobStatus.isDelayed) {
        await JobScheduler.cancelJob('order', order.expirationJob);
        order.expirationJob = null;
      }
    }
    
    // Handle cancellation case
    if (status === 'canceled') {
      return this.cancelOrder(order.id, false);
    }
    
    // Handle transition from canceled/expired to other status
    if (order.status === 'canceled' || order.status === 'expired') {
      // Check stock availability and decrement stock
      const transaction = await sequelize.transaction();
      try {
        for (const orderItem of order.OrderItems) {
          // Check if product has sufficient stock
          if (orderItem.Product.stock < orderItem.quantity) {
            throw new BadRequestError(`Insufficient stock for product: ${orderItem.ProductId} (${orderItem.Product.name})`);
          }
          
          // Decrement stock
          await ProductRepository.decrementStock(orderItem.ProductId, orderItem.quantity, transaction);
          logger.info(`Stock decremented for product: ${orderItem.ProductId}, quantity: ${orderItem.quantity}`);
          
          // Set order item to active
          orderItem.isActive = true;
          await orderItem.save({ transaction });
        }
        
        // Update order status
        order.status = status;
        order.expirationJob = null;
        await order.save({ transaction });
        
        await transaction.commit();
        logger.info(`Updated order status: ${orderId} to ${status}`);
        return order;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      // Regular status update (not from canceled/expired)
      order.status = status;
      order.expirationJob = null;
      await order.save();
      logger.info(`Updated order status: ${orderId} to ${status}`);
      return order;
    }
  }

  async handleOrderExpiration(order, transaction) {
    if (order.expiresAt) {
      const message = `Order ${order.id} already has expiration date`
      logger.warn(message);
      throw new BadRequestError(message);
    }
    const payload = {
      order: order,
      message: 'This schedules order expiration',
    };
    const expirationDate = businessConfig.order.pendingExpirationTime();
    const jobId = await JobScheduler.scheduleJob(ORDER.ORDER_EXPIRATION, payload, expirationDate);
    order.expirationJob = jobId;
    order.expiresAt = expirationDate;
    await order.save({ transaction });
  }

  async cancelOrder(orderId, expired=False) {
    const transaction = await sequelize.transaction();
    
    const orderStatus = expired ? "expired" : "canceled";
    
    try {
      const order = await OrderRepository.findById(orderId, { transaction });
      if (!order) {
        throw new NotFoundError('Order not found');
      }
      
      if (order.status == 'canceled' || order.status == 'expired') {
        throw new BadRequestError('Order cannot be cancelled');
      }
      if (order.expirationJob) {
        const jobStatus = await JobScheduler.getJobStatus(order.expirationJob, "order");
        if (jobStatus.isDelayed) {
          await JobScheduler.cancelJob('order', order.expirationJob);
        }
      }
      
      await OrderRepository.update(orderId, { status: orderStatus, paymentStatus: "canceled", expirationJob: null }, { transaction });
      for (const item of order.OrderItems) {
        console.log(item)
        if (item.isActive === true) {
          await ProductRepository.incrementStock(item.ProductId, item.quantity, transaction);
          logger.info(`Stock incremented for product: ${item.ProductId}, quantity: ${item.quantity}`);
        }
      }
      
      await transaction.commit();
      logger.info(`Order canceled with status ${orderStatus}: ${orderId}`);
      
      return { message: 'Order canceled' };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Order cancellation failed: ${error.message}`);
      throw error;
    }
  }
}

export default new OrderService();
