import BaseRepository from './BaseRepository.js';
import { Category, Product } from '../models/index.js';
import sequelize from '../../configs/database.js';
import { Sequelize } from 'sequelize';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }
  
  async findWithProductCount() {
    return this.model.findAll({
      include: [
        {
          model: Product,
          attributes: []
        }
      ],
      attributes: [
        'id',
        'name',
        'description',
        [sequelize.fn('COUNT', sequelize.col('Products.id')), 'productCount']
      ],
      group: ['Category.id'],
      order: [['name', 'ASC']]
    });
  }

  async create(categoryData) {
    try {
      return await this.model.create(categoryData);
    } catch (error) {
      if (error instanceof Sequelize.UniqueConstraintError) {
        throw new Error('Category name already exists');
      }
      throw error; // rethrow other errors
    }
  }
}

export default new CategoryRepository();

