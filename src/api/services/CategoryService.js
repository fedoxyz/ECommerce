import CategoryRepository from '../repositories/CategoryRepository.js';

class CategoryService {
  async getAllCategories() {
    try {
      return CategoryRepository.findAll();
    } catch (error) {
      throw new Error('Error fetching categories');
    }
  }
  async getCategoriesWithProductCount() {
    try {
      return CategoryRepository.findAllWithProductCount();
    } catch (error) {
      throw new Error('Error fetching categories');
    }
  }

  async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(categoryData) {
    // Add additional logic as needed
    return CategoryRepository.create(categoryData);
  }

  async updateCategory(id, categoryData) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return CategoryRepository.update(id, categoryData);
  }

  async deleteCategory(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return CategoryRepository.delete(id);
  }
}

export default new CategoryService();

