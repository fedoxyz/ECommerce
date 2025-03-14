import BaseRepository from './BaseRepository.js';
import { Order, OrderItem, Product } from '../models/index.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByUserId(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return this.model.findAndCountAll({
      where: { UserId: userId },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(orderId) {
    return this.model.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });
  }

  async create(orderData) {
    return this.model.create(orderData, {
      include: [OrderItem]
    });
  }

  async update(orderId, updateData) {
    const [updatedRowsCount, updatedOrders] = await this.model.update(updateData, {
      where: { id: orderId },
      returning: true
    });

    if (updatedRowsCount === 0) {
      throw new Error('Order not found');
    }

    return updatedOrders[0];
  }

  async findByStatus(status, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return this.model.findAndCountAll({
      where: { status },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
  }
}

export default new OrderRepository();
