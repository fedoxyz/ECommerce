import express from 'express';
import PaymentController from '../controllers/PaymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /payments/orders/{id}/intent:
 *   post:
 *     summary: Create a payment intent for order
 *     description: Creates a new payment intent for an order.
 *     tags:
 *       - Payments
 *     parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       description: Order ID
 *       schema:
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 example: "USD"
 *               paymentMethod:
 *                type: string
 *                example: "stripe"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Payment intent created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "pi_1J2mZB2eZvKYlo2CxjYZlXHc"
 *                 status:
 *                   type: string
 *                   example: "requires_payment_method"
 *       500:
 *         description: Internal server error.
 */
router.post('/orders/:id/intent', authenticate, PaymentController.createPaymentIntent);

export default router;
