import PaymentService from "../services/PaymentService.js";
import OrderRepository from "../repositories/OrderRepository.js";
import logger from "../../utils/logger.js";

class PaymentController {
  async createPaymentIntent(req, res, next) {
    try {
      const orderId = req.params.id;
      const { currency, paymentMethod} = req.body;
      const order = await OrderRepository.findById(orderId);
      if (!order || order.UserId != req.user.id) {
        return res.status(404).json({ message: "Order not found" })
      }
      const paymentIntent = await PaymentService.createPaymentIntent(order, currency, paymentMethod);
      res.status(201).json(paymentIntent);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentIntent(req, res, next) {
    try {
      const { id } = req.params;
      const paymentIntent = await PaymentService.retrievePaymentIntent(id);
      if (!paymentIntent) {
        return res.status(404).json({ message: "Payment Intent not found" });
      }
      res.json(paymentIntent);
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();

