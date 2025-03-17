import { ORDER } from '../jobTypes.js';
import logger from '../../../utils/logger.js';
import OrderService from '../../../api/services/OrderService.js';

const expirationHandler= async (data) => {
  logger.debug('Order expiration handler triggered with data:', data);
  console.log(data)
  try {
    const expired = true
    await OrderService.cancelOrder(data.order.id, expired)
    logger.debug("Order is canceled")
    
  } catch (error) {
    logger.error(`Error during order expiration process: ${error.message}`);
    throw error;
  }
};

export default {
  [ORDER.ORDER_EXPIRATION]: expirationHandler,
};
