import PaymentRepository from "../repositories/PaymentRepository.js";
import logger from "../../utils/logger.js";
import sequelize from "../../configs/database.js"; 

class PaymentService {
  async createPaymentIntent(order, currency, paymentMethod) {
    const transaction = await sequelize.transaction(); // Start transaction
    try {
      const paymentIntentData = {
        OrderId: order.id,
        UserId: order.UserId,
        amount: order.totalAmount,
        currency,
        paymentMethod,
        status: "pending",
      };

      // Create payment intent
      const paymentIntent = await PaymentRepository.create(paymentIntentData, { transaction });

      logger.debug(paymentIntent);

      // Update order with payment method and intent ID
      order.paymentIntentId = paymentIntent.id;
      await order.save({ transaction });

      // Commit transaction
      await transaction.commit();

      return paymentIntent;
    } catch (error) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId) {
    return PaymentRepository.findById(paymentIntentId);
  }
}

export default new PaymentService();

