import ProductRepository from '../repositories/ProductRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';

class ProductService {
  async getAllProducts(page, limit, query) {
    return ProductRepository.findAllWithPagination(page, limit, query);
  }
  
  async getProductById(productId) {
    const product = await ProductRepository.findById(productId, {
      include: ['Category', 'Reviews']
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }
  
  async createProduct(productData) {
    // Check if category exists
    if (productData.categoryId) {
      const category = await CategoryRepository.findById(productData.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
    }
    
    return ProductRepository.create(productData);
  }
  
  async updateProduct(productId, productData) {
    // Check if product exists
    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Check if category exists if categoryId is provided
    if (productData.categoryId) {
      const category = await CategoryRepository.findById(productData.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
    }
    
    return ProductRepository.update(productId, productData);
  }
  
  async deleteProduct(productId) {
    const deleted = await ProductRepository.delete(productId);
    if (!deleted) {
      throw new Error('Product not found');
    }
    
    return { message: 'Product deleted successfully' };
  }
}

export default new ProductService();

