import CategoryService from '../services/CategoryService.js';

class CategoryController {
  async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesWithProductCount(req, res, next) {
    try {
      const categories = await CategoryService.getCategoriesWithProductCount();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const response = await CategoryService.deleteCategory(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();

