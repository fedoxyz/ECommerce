import express from 'express';
import productController from '../controllers/ProductController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { validateProduct } from '../validators/product.validator.js';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, isAdmin, validateProduct, productController.createProduct);
router.put('/:id', authenticate, isAdmin, validateProduct, productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);

export default router;
