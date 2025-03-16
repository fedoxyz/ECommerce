import EventEmitter from '../emitter.js';
import { CART_EVENTS } from '../types.js';  // Importing the new cart event types
import websocketService from '../../../websocket/socket.js';
import scheduler from '../../scheduler.js';
import wsConfig from '../../../../configs/websocket.js';
import logger from '../../../../utils/logger.js';
/**
 * Cart Event Handlers
 * Handle events related to shopping carts
 */
class CartEventHandlers {
  constructor() {
    this.registerHandlers();
  }

  /**
   * Register all cart-related event handlers
   */
  registerHandlers() {
    // Handle cart update events
    EventEmitter.on(CART_EVENTS.CART_UPDATED, this.handleCartUpdated.bind(this));
    
    // Handle item added to cart
    EventEmitter.on(CART_EVENTS.CART_ITEM_ADDED, this.handleItemAdded.bind(this));
    
    // Handle abandoned cart monitoring
    EventEmitter.on(CART_EVENTS.CART_CREATED, this.setupAbandonedCartMonitoring.bind(this));
    
    // Register job handler for abandoned cart reminder
    scheduler.registerHandler('abandoned_cart_reminder', this.processAbandonedCartReminder.bind(this));
  }

  /**
   * Handle cart updated event
   * @param {Object} cartData - Cart data
   * @param {Object} metadata - Event metadata
   */
  async handleCartUpdated(cartData, metadata) {
    const { id, userId, items, total } = cartData;
    
    try {
      // Update abandoned cart timer
      if (items.length > 0) {
        await this.refreshAbandonedCartTimer(id, userId);
      } else {
        // Cart is empty, cancel abandoned cart reminder
        await scheduler.cancelJob(`abandoned_cart:${id}`);
      }
      
      // Notify user via WebSocket
      await websocketService.notify(
        wsConfig.events.CART_UPDATED,
        { 
          cartId: id, 
          itemCount: items.length,
          total
        },
        `user:${userId}`,
        wsConfig.namespaces.CART
      );
      
      logger.info(`Processed cart update for cart ${id}`);
    } catch (error) {
      logger.error('Error handling cart updated event:', error);
    }
  }

  /**
   * Handle item added to cart event
   * @param {Object} data - Item data
   * @param {Object} metadata - Event metadata
   */
  async handleItemAdded(data, metadata) {
    const { cartId, userId, product, quantity } = data;
    
    try {
      // Refresh abandoned cart timer
      await this.refreshAbandonedCartTimer(cartId, userId);
      
      // Notify user via WebSocket
      await websocketService.notify(
        wsConfig.events.CART_ITEM_ADDED,
        { 
          cartId, 
          product: {
            id: product.id,
            name: product.name,
            price: product.price
          },
          quantity
        },
        `user:${userId}`,
        wsConfig.namespaces.CART
      );
      
      // Check if product is low in stock
      if (product.stock < 10) {
        await websocketService.notify(
          'product:low_stock',
          { 
            productId: product.id, 
            stock: product.stock,
            message: 'This item is running low in stock!'
          },
          `user:${userId}`,
          wsConfig.namespaces.PRODUCTS
        );
      }
      
      logger.info(`Processed item added to cart ${cartId}`);
    } catch (error) {
      logger.info('Error handling item added event:', error);
    }
  }

  /**
   * Set up abandoned cart monitoring
   * @param {Object} cartData - Cart data
   * @param {Object} metadata - Event metadata
   */
  async setupAbandonedCartMonitoring(cartData, metadata) {
    const { id, userId } = cartData;
    
    try {
      // Set up abandoned cart reminder
      await this.refreshAbandonedCartTimer(id, userId);
      
      logger.info(`Set up abandoned cart monitoring for cart ${id}`);
    } catch (error) {
      logger.error('Error setting up abandoned cart monitoring:', error);
    }
  }

  /**
   * Refresh abandoned cart timer
   * @param {string} cartId - Cart ID
   * @param {string} userId - User ID
   */
  async refreshAbandonedCartTimer(cartId, userId) {
    // Cancel existing job if any
    await scheduler.cancelJob(`abandoned_cart:${cartId}`);
    
    // Schedule new abandoned cart reminder
    await scheduler.scheduleJob(
      'abandoned_cart_reminder',
      { cartId, userId },
      3600, // 1 hour in seconds
      { jobId: `abandoned_cart:${cartId}` }
    );
  }

  /**
   * Process abandoned cart reminder
   * @param {Object} jobData - Job data
   * @param {Object} jobInfo - Job info
   */
  async processAbandonedCartReminder(jobData, jobInfo) {
    const { cartId, userId } = jobData;
    
    try {
      // Emit abandoned cart event
      EventEmitter.emit(CART_EVENTS.CART_ABANDONED, { cartId, userId });
      
      // Notify user via WebSocket
      await websocketService.notify(
        'cart:reminder',
        { 
          cartId,
          message: 'You have items waiting in your cart!'
        },
        `user:${userId}`,
        wsConfig.namespaces.NOTIFICATIONS
      );
      
      // Schedule a follow-up reminder with discount
      await scheduler.scheduleJob(
        'abandoned_cart_discount',
        { 
          cartId, 
          userId,
          discount: {
            type: 'percentage',
            value: 10
          }
        },
        86400, // 24 hours in seconds
        { jobId: `abandoned_cart_discount:${cartId}` }
      );
      
      logger.info(`Processed abandoned cart reminder for cart ${cartId}`);
    } catch (error) {
      logger.info('Error processing abandoned cart reminder:', error);
    }
  }
}

// Initialize handlers
export default new CartEventHandlers();

