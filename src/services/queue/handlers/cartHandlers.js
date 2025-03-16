import { CART } from '../events.js';
import logger from '../../../utils/logger.js';
import CartService from '../../../api/services/CartService.js';

const expirationHandler = async (data) => {
  logger.debug('Cart expiration handler triggered with data:', data);
  try {
    CartService.clearCart(data.cart.UserId)
    logger.debug("Cart is cleared")
    
  } catch (error) {
    logger.error(`Error during cart expiration process: ${error.message}`);
    throw error;
  }
};

export default {
  [CART.CART_EXPIRATION]: expirationHandler,
};
