import ProductService from '../services/ProductService.js';

class ProductController {
  async getAllProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const query = {
        categoryId: req.query.categoryId,
        search: req.query.search,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice
      };
      
      const result = await ProductService.getAllProducts(page, limit, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  
  async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
 
  async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }
 
  async updateProduct(req, res, next) {
    try {
      // Get the fields to update from the request body
      const productId = req.params.id;
      const productData = req.body; // This contains only the fields that need to be updated
  
      // Pass the product data to the service to handle the update
      const updatedProduct = await ProductService.updateProduct(productId, productData);
      
      // Return the updated product in the response
      res.status(200).json(updatedProduct);
    } catch (error) {
      next(error);
    }
  }


  async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
  
  async deleteProduct(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchProducts(req, res) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      const filters = {
        categoryId: req.query.categoryId,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        includeFullData: req.query.includeFullData === 'true'
      };
      
      const result = await this.productService.searchProducts(q, page, limit, filters);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error searching products:', error);
      return res.status(500).json({ 
        message: 'Failed to search products',
        error: error.message 
      });
    }
  }

  async syncProductsToElasticsearch(req, res) {
    try {
      // This should be an admin-only endpoint
      if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const result = await this.productService.syncProductsToElasticsearch();
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error syncing products to Elasticsearch:', error);
      return res.status(500).json({ 
        message: 'Failed to sync products',
        error: error.message 
      });
    }
  }
}

export default new ProductController();

