import { Op } from 'sequelize';
import BaseRepository from './BaseRepository.js';
import { Product, Category, Review } from '../models/index.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findAllWithPagination(page = 1, limit = 10, query = {}) {
    const options = {
      include: [
        { model: Category },
        { model: Review }
      ],
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      where: {}
    };

    if (query.categoryId) {
      options.where.categoryId = query.categoryId;
    }

    if (query.search) {
      options.where.name = { [Op.iLike]: `%${query.search}%` };
    }

    if (query.minPrice || query.maxPrice) {
      options.where.price = {};
      if (query.minPrice) {
        options.where.price[Op.gte] = query.minPrice;
      }
      if (query.maxPrice) {
        options.where.price[Op.lte] = query.maxPrice;
      }
    }

    const { count, rows } = await this.model.findAndCountAll(options);
    
    return {
      products: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  async findByCategory(categoryId) {
    return this.findAll({
      where: { categoryId },
      include: [{ model: Category }, { model: Review }]
    });
  }

  async findTopRated(limit = 5) {
    return this.findAll({
      include: [
        { model: Review }
      ],
      attributes: {
        include: [
          [sequelize.fn('AVG', sequelize.col('Reviews.rating')), 'averageRating']
        ]
      },
      group: ['Product.id'],
      order: [[sequelize.literal('averageRating'), 'DESC']],
      limit
    });
  }
}

export default new ProductRepository();

