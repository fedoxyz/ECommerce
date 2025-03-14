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
}

export default new ProductController();

