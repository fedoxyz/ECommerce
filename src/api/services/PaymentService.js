// src/api/services/PaymentService.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger.js';
import { BadRequestError } from '../../utils/errors.js';

class PaymentService {
  constructor() {
    this.apiUrl = process.env.PAYMENT_API_URL || 'https://mockpayment.com/api';
    this.apiKey = process.env.PAYMENT_API_KEY || 'test_key';
  }

  async createPaymentIntent(amount, currency = 'USD', metadata = {}) {
    try {
      // Mock response for development
      const mockResponse = {
        id: `pi_${uuidv4().replace(/-/g, '')}`,
        object: 'payment_intent',
        amount,
        currency,
        status: 'requires_payment_method',
        client_secret: `pi_${uuidv4().replace(/-/g, '')}_secret_${uuidv4().substring(0, 8)}`,
        created: Date.now() / 1000,
        metadata
      };
      
      logger.info(`Created payment intent: ${mockResponse.id}`);
      return mockResponse;
    } catch (error) {
      logger.error(`Payment intent creation failed: ${error.message}`);
      throw new BadRequestError('Failed to create payment intent');
    }
  }

  async processPayment(paymentIntentId, paymentMethodId) {
    try {
      // Mock response for development
      const mockResponse = {
        id: paymentIntentId,
        object: 'payment_intent',
        status: Math.random() > 0.1 ? 'succeeded' : 'failed', // 90% success rate for testing
        charges: {
          data: [
            {
              id: `ch_${uuidv4().replace(/-/g, '')}`,
              payment_method: paymentMethodId,
              status: 'succeeded',
              created: Date.now() / 1000
            }
          ]
        }
      };
      
      logger.info(`Processed payment: ${paymentIntentId} with status: ${mockResponse.status}`);
      return mockResponse;
    } catch (error) {
      logger.error(`Payment processing failed: ${error.message}`);
      throw new BadRequestError('Failed to process payment');
    }
  }

  async refundPayment(chargeId, amount) {
    try {
      // Mock response for development
      const mockResponse = {
        id: `re_${uuidv4().replace(/-/g, '')}`,
        object: 'refund',
        amount,
        charge: chargeId,
        status: Math.random() > 0.1 ? 'succeeded' : 'failed', // 90% success rate for testing
        created: Date.now() / 1000
      };
      
      logger.info(`Refunded payment: ${chargeId} with status: ${mockResponse.status}`);
      return mockResponse;
    } catch (error) {
      logger.error(`Refund failed: ${error.message}`);
      throw new BadRequestError('Failed to process refund');
    }
  }
}

export default new PaymentService();
