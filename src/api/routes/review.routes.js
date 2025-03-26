import express from 'express';
import ReviewController from '../controllers/ReviewController.js';
import { authenticate } from '../middleware/auth.js';
import { validateReviewId, validateReviewCreate, validateReviewUpdate, validateProductId } from '../validators/review.validator.js';

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API for managing product reviews
 */

const router = express.Router();

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
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
 *                 example: "12345"
 *               rating:
 *                 type: integer
 *                 example: 10
 *               comment:
 *                 type: string
 *                 example: "Great product!"
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validateReviewCreate, ReviewController.createReview);
/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: List of reviews
 *       400:
 *         description: Bad request
 */
router.get('/product/:productId', validateProductId, ReviewController.getReviewsForProduct);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
router.get('/:id', ReviewController.getReviewById);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update a review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 example: 10
 *               comment:
 *                 type: string
 *                 example: "Updated review comment"
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.put('/:id', authenticate, validateReviewId, validateReviewUpdate, ReviewController.updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       204:
 *         description: Review deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.delete('/:id', authenticate, ReviewController.deleteReview);

export default router;

