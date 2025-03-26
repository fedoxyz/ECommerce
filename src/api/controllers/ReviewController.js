import ReviewService from '../services/ReviewService.js';

class ReviewController {
  async createReview(req, res, next) {
    try {
      const review = await ReviewService.createReview(req.user.id, req.user.firstName, req.body);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsForProduct(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { productId }  = req.params; 
      const reviews = await ReviewService.getReviewsForProduct(productId, page, limit);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  async getReviewById(req, res, next) {
    try {
      const review = await ReviewService.getReviewById(req.params.id);
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const updatedReview = await ReviewService.updateReview(req.user.id, req.params.id, req.body);
      res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const deleted = await ReviewService.deleteReview(req.params.id, req.user.id);
      res.json(deleted);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
