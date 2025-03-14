import ProductController from '../../src/api/controllers/ProductController.js';
import ProductService from '../../src/api/services/ProductService.js';

jest.mock('../../src/api/services/ProductService.js');

describe('ProductController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [{ id: '1', name: 'Product 1' }, { id: '2', name: 'Product 2' }];
      ProductService.getAllProducts.mockResolvedValue(mockProducts);

      await ProductController.getAllProducts(req, res, next);

      expect(ProductService.getAllProducts).toHaveBeenCalledWith(1, 10, {});
      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      ProductService.getAllProducts.mockRejectedValue(error);

      await ProductController.getAllProducts(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // Add more tests for other controller methods...
});
