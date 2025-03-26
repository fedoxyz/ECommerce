import BaseRepository from './BaseRepository.js';
import Review from '../models/Review.js';

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findByProductId(productId, page, limit) {
    const options = {
      where: { productId },
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    };
    const { count, rows } = await this.model.findAndCountAll(options);
    
    return {
      reviews: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }
}

export default new ReviewRepository();

