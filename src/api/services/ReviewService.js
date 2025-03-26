import ReviewRepository from '../repositories/ReviewRepository.js';

class ReviewService {
  async createReview(userId, authorName, reviewData) {
    reviewData = {...reviewData,
      userId,
      authorName,
    }
    return await ReviewRepository.create(reviewData);
  }

  async getReviewsForProduct(productId, page = 1, limit = 10) {
    return await ReviewRepository.findByProductId(productId, page, limit);
  }

  async getReviewById(reviewId) {
    return await ReviewRepository.findById(reviewId);
  }

  async updateReview(userId, reviewId, updateData) {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Only author can edit');

    return await ReviewRepository.update(reviewId, updateData);
  }

  async deleteReview(reviewId, userId) {
    const review = await ReviewRepository.findById(reviewId);
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error(`You don't have rights to delete this review`);

    await ReviewRepository.delete(reviewId);
    return {message: "Review has been successfully deleted.", reviewId}
  }
}

export default new ReviewService();

