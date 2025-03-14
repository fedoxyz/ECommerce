import { v4 as uuidv4 } from 'uuid';
import OrderRepository from '../repositories/OrderRepository.js';
import CartRepository from '../repositories/CartRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import PaymentService from './PaymentService.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

class OrderService {
  async createOrder(userId, orderData) {
    const { shippingAddress, paymentMethod } = orderData;

    // Get user's cart
    const cart = await CartRepository.findByUserId(userId);
    if (!cart || cart.CartItems.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of cart.CartItems) {
      const product = await ProductRepository.findById(item.ProductId);
      if (!product) {
        throw new NotFoundError(`Product not found: ${item.ProductId}`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for product: ${product.name}`);
      }
      totalAmount += product.price * item.quantity;
    }

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent(totalAmount * 100, 'USD', { userId });

    // Create order
    const order = await OrderRepository.create({
      id: uuidv4(),
      UserId: userId,
      totalAmount,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      paymentIntentId: paymentIntent.id,
      OrderItems: cart.CartItems.map(item => ({
        ProductId: item.ProductId,
        quantity: item.quantity,
        price: item.price
      }))
    });

    // Clear the cart
    await CartRepository.clearCart(cart.id);

    // Update product stock
    for (const item of cart.CartItems) {
      await ProductRepository.updateStock(item.ProductId, -item.quantity);
    }

    logger.info(`Created order: ${order.id} for user: ${userId}`);
    return order;
  }

  async getUserOrders(userId, page = 1, limit = 10) {
    const orders = await OrderRepository.findByUserId(userId, page, limit);
    return orders;
  }

  async getOrderById(orderId, userId) {
    const order = await OrderRepository.findById(orderId);
    if (!order || order.UserId !== userId) {
      throw new NotFoundError('Order not found');
    }
    return order;
  }

  async updateOrderStatus(orderId, status) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const updatedOrder = await OrderRepository.update(orderId, { status });
    logger.info(`Updated order status: ${orderId} to ${status}`);
    return updatedOrder;
  }

  async processPayment(orderId, paymentMethodId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== 'pending') {
      throw new BadRequestError('Order is not in pending status');
    }

    const paymentResult = await PaymentService.processPayment(order.paymentIntentId, paymentMethodId);

    if (paymentResult.status === 'succeeded') {
      await this.updateOrderStatus(orderId, 'paid');
      logger.info(`Payment processed successfully for order: ${orderId}`);
    } else {
      await this.updateOrderStatus(orderId, 'payment_failed');
      logger.error(`Payment failed for order: ${orderId}`);
      throw new BadRequestError('Payment processing failed');
    }

    return paymentResult;
  }

  async cancelOrder(orderId) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== 'pending' && order.status !== 'paid') {
      throw new BadRequestError('Order cannot be cancelled');
    }

    // Refund if the order was paid
    if (order.status === 'paid') {
      await PaymentService.refundPayment(order.paymentIntentId, order.totalAmount * 100);
    }

    // Update product stock
    for (const item of order.OrderItems) {
      await ProductRepository.updateStock(item.ProductId, item.quantity);
    }

    const cancelledOrder = await OrderRepository.update(orderId, { status: 'cancelled' });
    logger.info(`Cancelled order: ${orderId}`);
    return cancelledOrder;
  }
}

export default new OrderService();

