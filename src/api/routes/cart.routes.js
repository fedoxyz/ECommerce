import express from 'express';
import cartController from '../controllers/CartController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAddToCart, validateUpdateCartItem } from '../validators/cart.validator.js';

const router = express.Router();

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, validateAddToCart, cartController.addItem);
router.put('/items/:itemId', authenticate, validateUpdateCartItem, cartController.updateItem);
router.delete('/items/:itemId', authenticate, cartController.removeItem);
router.delete('/', authenticate, cartController.clearCart);

export default router;
