import CartRepository from '../repositories/CartRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import sequelize from '../../configs/database.js';
import logger from '../../utils/logger.js';

class CartService {
  async getCart(userId) {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    return cart;
  }
 
  async addItemToCart(userId, productId, quantity) {
    const transaction = await sequelize.transaction(); // Start transaction
    logger.info(`Transaction started for user ID: ${userId}`); // Log info when starting the transaction
  
    try {
      logger.debug("Entering try block"); // Debug log for entering the block
  
      // Check if product exists and has enough stock
      const product = await ProductRepository.findById(productId, { transaction });
      if (!product) {
        logger.error(`Product not found for product ID: ${productId}`); // Log error if product doesn't exist
        throw new Error('Product not found');
      }
  
      if (product.stock < quantity) {
        logger.warn(`Insufficient stock for product ID: ${productId}. Requested: ${quantity}, Available: ${product.stock}`); // Log warning for insufficient stock
        throw new Error('Insufficient stock');
      }
  
      logger.info(`Stock available: ${product.stock}, Quantity requested: ${quantity}`); // Log info for stock check
  
      // Reduce stock temporarily within the transaction
      await ProductRepository.decrementStock(productId, quantity, transaction);
      logger.info(`Stock for product ID ${productId} decremented by ${quantity}`); // Log info for stock decrement
  
      // Get or create user's cart within the transaction
      const cart = await CartRepository.findByUserId(userId, transaction);
      logger.info(`Cart found for user ID: ${userId}. Cart ID: ${cart.id}`); // Log info about the cart found
  
      // Add item to cart within the transaction
      await CartRepository.addItem(cart.id, productId, quantity, product.price, transaction);
      logger.info(`Item added to cart. Cart ID: ${cart.id}, Product ID: ${productId}, Quantity: ${quantity}`); // Log info for item added to cart
  
      // Commit the transaction if everything succeeds
      await transaction.commit();
      logger.info("Transaction committed successfully");
  
      return { success: true };
    } catch (error) {
      // Rollback transaction if anything goes wrong
      logger.error(`Error occurred, rolling back transaction: ${error.message}`); // Log error during the process
      await transaction.rollback();
      throw error;
    }
  }

  
  async updateCartItem(userId, itemId, quantity) {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    const cartItem = cart.CartItems.find(item => item.id === itemId);
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Check if the product has enough stock
    const product = await ProductRepository.findById(cartItem.ProductId);
    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    await CartRepository.updateItem(cart.id, itemId, quantity);
    return this.getCart(userId);
  }

  async removeCartItem(userId, itemId) {
    const transaction = await sequelize.transaction(); // Start transaction
    try {
  
      const cart = await CartRepository.findByUserId(userId, transaction);
      
      if (!cart) {
        throw new Error('Cart not found');
      }
    
      // Check if CartItems exists and log
      if (!cart.CartItems || cart.CartItems.length === 0) {
        throw new Error('No items in the cart');
      }
      
      const item = cart.CartItems.find(item => item.Product.dataValues.id === itemId);
    
      // Check if the item was found
      if (!item) {
        throw new Error(`Item with id ${itemId} not found in cart`);
      }
    
      // Ensure `product` has the necessary fields
      const product = item.Product.dataValues;
      
      // Increment stock of the product
      await ProductRepository.incrementStock(product.id, item.quantity, transaction);
    
      // Remove the item from the cart
      await CartRepository.removeItem(cart.id, item.id, transaction);
      
      transaction.commit();
      return { message: `Item ${itemId} removed successfully` };
    } catch (error){
      await transaction.rollback();
      throw error;
    }
  }
}

export default new CartService();

