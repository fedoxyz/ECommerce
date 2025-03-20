import { CART } from '../jobTypes.js';
import logger from '../../../utils/logger.js';
import CartService from '../../../api/services/CartService.js';
import JobScheduler from "../scheduler.js"

const expirationHandler = async (data) => {
  logger.debug(`Cart expiration handler triggered with data: ${JSON.stringify(data)}`);
  try {
    const isAbandoned = true;
    await CartService.clearCart(data.cart.UserId, isAbandoned)
    await JobScheduler.scheduleJob(`email:cart-abandoned`, {
      template: `cart.cartAbandoned`,
      to: data.email,
      cartItems: data.cart.CartItems,
      subject: "Your cart is abandoned :("
    }, new Date());

    logger.debug("Cart is cleared")
    
  } catch (error) {
    logger.error(`Error during cart expiration process: ${error.message}`);
    throw error;
  }
};

export default {
  [CART.CART_EXPIRATION]: expirationHandler,
};
