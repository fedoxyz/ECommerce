import BaseRepository from './BaseRepository.js';
import { Category, Product } from '../models/index.js';
import sequelize from '../../configs/database.js';

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
}

export default new CategoryRepository();

