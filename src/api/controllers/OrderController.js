import OrderService from '../services/OrderService.js';

class OrderController {
  async getAllOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const orders = await OrderService.getUserOrders(req.user.id, page, limit);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
  
  async getOrderById(req, res, next) {
    try {
      const order = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
  
  async createOrder(req, res, next) {
    try {
      const order = await OrderService.createOrder(req.user.id, req.body);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
  
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await OrderService.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
  
  async processPayment(req, res, next) {
    try {
      const { paymentDetails } = req.body;
      const result = await OrderService.processPayment(req.params.id, paymentDetails);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();

