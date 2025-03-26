import express from 'express';
import WishlistController from '../controllers/WishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Operations related to user wishlist
 */

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get the user's wishlist
 *     description: Retrieve the list of items in the user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: a list of wishlist items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "user-1234-5678-abcd-efgh"
 *                 wishlist:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "wishlist-1234-5678-abcd-efgh"
 *                     userId:
 *                       type: string
 *                       example: "user-1234-5678-abcd-efgh"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-01T12:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-01T12:00:00Z"
 *                     WishlistItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "item-1234-5678-abcd-efgh"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-01T12:01:00Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-01T12:01:00Z"
 *                           wishlistId:
 *                             type: string
 *                             example: "wishlist-1234-5678-abcd-efgh"
 *                           productId:
 *                             type: string
 *                             example: "product-5678-1234-abcd-efgh"
 *                           Product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "product-5678-1234-abcd-efgh"
 *                               name:
 *                                 type: string
 *                                 example: "Sample Product"
 *                               description:
 *                                 type: string
 *                                 example: "This is a sample product description."
 *                               price:
 *                                 type: string
 *                                 example: "19.99"
 *                               stock:
 *                                 type: integer
 *                                 example: 100
 *                               imageUrl:
 *                                 type: string
 *                                 example: "https://example.com/sample-product.jpg"
 *                               isActive:
 *                                 type: boolean
 *                                 example: true
 *                               categoryId:
 *                                 type: string
 *                                 example: "category-1234-5678-abcd-efgh"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-01-01T12:00:00Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-01-01T12:00:00Z"
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, WishlistController.getWishlist);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Add an item to the user's wishlist
 *     description: Add a product to the wishlist using the provided product ID
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "product-5678-1234-abcd-efgh"
 *     responses:
 *       200:
 *         description: Product successfully added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product added to wishlist successfully"
 *                 item:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "item-1234-5678-abcd-efgh"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-01T12:01:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-01T12:01:00Z"
 *                     wishlistId:
 *                       type: string
 *                       example: "wishlist-1234-5678-abcd-efgh"
 *                     productId:
 *                       type: string
 *                       example: "product-5678-1234-abcd-efgh"
 *       400:
 *         description: Bad request (e.g., invalid product ID)
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, WishlistController.addItem);

/**
 * @swagger
 * /wishlist:
 *   delete:
 *     summary: Remove an item from the user's wishlist
 *     description: Remove a product from the wishlist using the provided item ID
 *     tags: [Wishlist]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: "item-1234-5678-abcd-efgh"
 *     responses:
 *       200:
 *         description: Product successfully removed from wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product removed from wishlist successfully"
 *                 itemId:
 *                   type: string
 *                   example: "item-1234-5678-abcd-efgh"
 *       400:
 *         description: Bad request (e.g., invalid item ID)
 *       500:
 *         description: Internal server error
 */
router.delete('/', authenticate,  WishlistController.removeItem);

export default router;

