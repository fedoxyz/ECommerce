import BaseRepository from './BaseRepository.js';
import { Order, OrderItem, Product } from '../models/index.js';
import logger from '../../utils/logger.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async create(data, options = {}) {
    try {
      const { OrderItems, ...orderData } = data;
      logger.debug(`data: ${JSON.stringify(data, null, 2)}`);
      
      // Create the order
      const order = await this.model.create(orderData, options);
      
      // Create order items if provided
      if (OrderItems && OrderItems.length > 0) {
        const items = OrderItems.map(item => ({
          ...item,
          OrderId: order.id
        }));
        await OrderItem.bulkCreate(items, options);
      }
      
      // Return order with items
      return this.findById(order.id, options);
    } catch (error) {
      logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }

  async findById(id, options = {}) {
    try {
      const order = await this.model.findByPk(id, {
        include: [
          {
            model: OrderItem,
            include: [Product]
          }
        ],
        ...options
      });
      return order;
    } catch (error) {
      logger.error(`Failed to find order by ID: ${error.message}`);
      throw error;
    }
  }

  async update(id, data, options = {}) {
    try {
      await this.model.update(data, {
        where: { id },
        ...options
      });
      return this.findById(id, options);
    } catch (error) {
      logger.error(`Failed to update order: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(userId, page = 1, limit = 10, options = {}) {
  try {
    const offset = (page - 1) * limit;

    // First, get an accurate count of parent records only
    const totalCount = await this.model.count({
      where: { UserId: userId },
      distinct: true, 
    });
    
    // Then get the paginated data with associations
    const rows = await this.model.findAll({
      where: { UserId: userId },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      ...options
    });
    
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: rows,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages
      }
    };
  } catch (error) {
    console.error(`Debug - Error details:`, error);
    logger.error(`Failed to find orders by user ID: ${error.message}`);
    throw error;
  }
}

}

export default new OrderRepository();
