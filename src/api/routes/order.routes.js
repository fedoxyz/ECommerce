import express from 'express';
import orderController from '../controllers/OrderController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { validateCreateOrder, validateUpdateOrderStatus } from '../validators/order.validator.js';

const router = express.Router();

router.get('/', authenticate, orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/', authenticate, validateCreateOrder, orderController.createOrder);
router.put('/:id/status', authenticate, isAdmin, validateUpdateOrderStatus, orderController.updateOrderStatus);
router.post('/:id/payment', authenticate, orderController.processPayment);

export default router;
