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
  
  try {
    return await CategoryRepository.delete(id);
  } catch (error) {
    // Check if this is a foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError' || 
        (error.original && error.original.constraint && 
         error.original.constraint.includes('categoryId_fkey'))) {
      // Transform into a more friendly error
      throw new Error('Cannot delete this category because it has associated products');
    }
    // Re-throw any other errors
    throw error;
  }
}

}

export default new CategoryService();

