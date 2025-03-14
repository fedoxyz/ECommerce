import CartService from '../../src/api/services/CartService.js';
import CartRepository from '../../src/api/repositories/CartRepository.js';
import ProductRepository from '../../src/api/repositories/ProductRepository.js';

jest.mock('../../src/api/repositories/CartRepository.js');
jest.mock('../../src/api/repositories/ProductRepository.js');

describe('CartService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItemToCart', () => {
    it('should add an item to the cart successfully', async () => {
      const userId = '1';
      const productId = '2';
      const quantity = 2;
      const product = { id: productId, price: 10, stock: 5 };
      const cart = { id: '3', UserId: userId };
      const addedItem = { id: '4', CartId: cart.id, ProductId: productId, quantity, price: product.price };

      ProductRepository.findById.mockResolvedValue(product);
      CartRepository.findByUserId.mockResolvedValue(cart);
      CartRepository.addItem.mockResolvedValue(addedItem);

      const result = await CartService.addItemToCart(userId, productId, quantity);

      expect(ProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(CartRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(CartRepository.addItem).toHaveBeenCalledWith(cart.id, productId, quantity, product.price);
      expect(result).toEqual(addedItem);
    });

    it('should throw an error if product is not found', async () => {
      ProductRepository.findById.mockResolvedValue(null);

      await expect(CartService.addItemToCart('1', '2', 1)).rejects.toThrow('Product not found');
    });

    it('should throw an error if insufficient stock', async () => {
      const product = { id: '2', price: 10, stock: 1 };
      ProductRepository.findById.mockResolvedValue(product);

      await expect(CartService.addItemToCart('1', '2', 2)).rejects.toThrow('Insufficient stock');
    });
  });

  // Add more tests for other CartService methods...
});
