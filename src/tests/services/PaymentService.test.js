import PaymentService from '../../src/api/services/PaymentService.js';

describe('PaymentService', () => {
  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const amount = 1000;
      const currency = 'USD';
      const metadata = { orderId: '123' };

      const result = await PaymentService.createPaymentIntent(amount, currency, metadata);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('object', 'payment_intent');
      expect(result).toHaveProperty('amount', amount);
      expect(result).toHaveProperty('currency', currency);
      expect(result).toHaveProperty('status', 'requires_payment_method');
      expect(result).toHaveProperty('client_secret');
      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('metadata', metadata);
    });
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const paymentIntentId = 'pi_123';
      const paymentMethodId = 'pm_456';

      const result = await PaymentService.processPayment(paymentIntentId, paymentMethodId);

      expect(result).toHaveProperty('id', paymentIntentId);
      expect(result).toHaveProperty('object', 'payment_intent');
      expect(result.status).toMatch(/^(succeeded|failed)$/);
      expect(result).toHaveProperty('charges.data[0].payment_method', paymentMethodId);
    });
  });

  // Add more tests for other PaymentService methods...
});
