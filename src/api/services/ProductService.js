import ProductRepository from '../repositories/ProductRepository.js';
import CategoryRepository from '../repositories/CategoryRepository.js';

class ProductService {
  async getAllProducts(page, limit, query) {
    return ProductRepository.findAllWithPagination(page, limit, query);
  }
  
  async getProductById(productId) {
    const product = await ProductRepository.findById(productId, {
      include: ['Category']
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

  async searchProducts(searchQuery, page = 1, limit = 10, filters = {}) {
    // Map query parameters to elasticsearch filters
    const searchFilters = {};
    
    if (filters.categoryId) {
      searchFilters.categoryId = filters.categoryId;
    }
    
    if (filters.minPrice) {
      searchFilters.minPrice = parseFloat(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      searchFilters.maxPrice = parseFloat(filters.maxPrice);
    }
    
    if (filters.tags) {
      searchFilters.tags = Array.isArray(filters.tags) 
        ? filters.tags 
        : [filters.tags];
    }
    
    const result = await this.searchOrchestrator.searchProducts(
      searchQuery,
      searchFilters,
      page,
      limit
    );
    
    // If we need to fetch additional data that's not in Elasticsearch
    // we can use the IDs to get full records from the database
    if (filters.includeFullData && result.products.length > 0) {
      const productIds = result.products.map(p => p.id);
      const dbProducts = await this.repository.findByIds(productIds);
      
      // Map Elasticsearch results to database results to preserve order and scores
      const productMap = {};
      dbProducts.forEach(product => {
        productMap[product.id] = product;
      });
      
      result.products = result.products.map(product => {
        return {
          ...productMap[product.id]?.dataValues || {},
          score: product.score,
          highlights: product.highlights
        };
      });
    }
    
    return result;
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
  
    // Validate categoryId if provided
    if (productData.categoryId) {
      const category = await CategoryRepository.findById(productData.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
    }
  
    // Update only the fields that are provided in the productData
    const updatedProduct = await ProductRepository.update(productId, productData);
  
    return updatedProduct;
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

