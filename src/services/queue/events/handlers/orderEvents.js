import EventEmitter from '../emitter.js';
import { ORDER_EVENTS } from '../types.js';
import websocketService from '../../../websocket/socket.js';
import scheduler from '../../scheduler.js';
import wsConfig from '../../../../configs/websocket.js';
import logger from '../../../../utils/logger.js';

/**
 * Order Event Handlers
 * Handle events related to orders
 */
class OrderEventHandlers {
  constructor() {
    this.registerHandlers();
  }

  /**
   * Register all order-related event handlers
   */
  registerHandlers() {
    // Handle order creation
    EventEmitter.on(ORDER_EVENTS.ORDER_CREATED, this.handleOrderCreated.bind(this));
    
    // Handle order status changes
    EventEmitter.on(ORDER_EVENTS.ORDER_STATUS_CHANGED, this.handleOrderStatusChanged.bind(this));
    
    // Handle payment processing
    EventEmitter.on(ORDER_EVENTS.ORDER_PAYMENT_PROCESSED, this.handlePaymentProcessed.bind(this));
    
    // Handle order cancellation
    EventEmitter.on(ORDER_EVENTS.ORDER_CANCELLED, this.handleOrderCancelled.bind(this));
  }

  /**
   * Handle order created event
   * @param {Object} orderData - Order data
   * @param {Object} metadata - Event metadata
   */
  async handleOrderCreated(orderData, metadata) {
    const { id, userId, total, items } = orderData;
    
    try {
      // Schedule payment reminder if payment pending
      await scheduler.scheduleJob(
        'order_payment_reminder',
        { orderId: id, userId },
        1800, // 30 minutes in seconds
        { jobId: `payment_reminder:${id}` }
      );
      
      // Notify user via WebSocket
      await websocketService.notify(
        wsConfig.events.ORDER_CREATED,
        { orderId: id, total, itemCount: items.length },
        `user:${userId}`,
        wsConfig.namespaces.ORDERS
      );
      
      // Schedule inventory check
      await scheduler.scheduleJob(
        'inventory_check',
        { orderId: id, items },
        60, // 1 minute in seconds
        { jobId: `inventory_check:${id}` }
      );
      
      logger.info(`Processed order created event for order ${id}`);
    } catch (error) {
      logger.error('Error handling order created event:', error);
    }
  }

  /**
   * Handle order status changed event
   * @param {Object} data - Status change data
   * @param {Object} metadata - Event metadata
   */
  async handleOrderStatusChanged(data, metadata) {
    const { orderId, userId, newStatus, oldStatus } = data;
    
    try {
      // Notify user via WebSocket
      await websocketService.notify(
        wsConfig.events.ORDER_STATUS_CHANGED,
        { orderId, status: newStatus, previousStatus: oldStatus },
        `user:${userId}`,
        wsConfig.namespaces.ORDERS
      );
      
      // Handle specific status transitions
      switch (newStatus) {
        case 'processing':
          // Schedule fulfillment check
          await scheduler.scheduleJob(
            'fulfillment_check',
            { orderId },
            3600, // 1 hour in seconds
            { jobId: `fulfillment_check:${orderId}` }
          );
          break;
          
        case 'shipped':
          // Cancel any pending payment reminders
          await scheduler.cancelJob(`payment_reminder:${orderId}`);
          break;
          
        case 'delivered':
          // Schedule review request
          await scheduler.scheduleJob(
            'request_review',
            { orderId, userId },
            86400, // 24 hours in seconds
            { jobId: `request_review:${orderId}` }
          );
          break;
      }
      
      logger.info(`Processed status change for order ${orderId}: ${oldStatus} -> ${newStatus}`);
    } catch (error) {
      logger.error('Error handling order status change event:', error);
    }
  }

  /**
   * Handle payment processed event
   * @param {Object} data - Payment data
   * @param {Object} metadata - Event metadata
   */
  async handlePaymentProcessed(data, metadata) {
    const { orderId, userId, status, amount } = data;
    
    try {
      // Cancel payment reminder
      await scheduler.cancelJob(`payment_reminder:${orderId}`);
      
      // Notify user
      await websocketService.notify(
        wsConfig.events.ORDER_PAYMENT_PROCESSED,
        { orderId, status, amount },
        `user:${userId}`,
        wsConfig.namespaces.ORDERS
      );
      
      if (status === 'success') {
        // Emit order status change event
        EventEmitter.emit(ORDER_EVENTS.ORDER_STATUS_CHANGED, {
          orderId,
          userId,
          newStatus: 'processing',
          oldStatus: 'pending'
        });
      } else if (status === 'failed') {
        // Schedule payment retry reminder
        await scheduler.scheduleJob(
          'payment_retry_reminder',
          { orderId, userId },
          3600, // 1 hour in seconds
          { jobId: `payment_retry:${orderId}` }
        );
      }
      
      logger.info(`Processed payment for order ${orderId}: ${status}`);
    } catch (error) {
      logger.error('Error handling payment processed event:', error);
    }
  }

  /**
   * Handle order cancelled event
   * @param {Object} data - Cancellation data
   * @param {Object} metadata - Event metadata
   */
  async handleOrderCancelled(data, metadata) {
    const { orderId, userId, reason } = data;
    
    try {
      // Cancel all scheduled jobs related to this order
      await scheduler.cancelJob(`payment_reminder:${orderId}`);
      await scheduler.cancelJob(`inventory_check:${orderId}`);
      await scheduler.cancelJob(`fulfillment_check:${orderId}`);
      await scheduler.cancelJob(`request_review:${orderId}`);
      
      // Notify user
      await websocketService.notify(
        wsConfig.events.ORDER_CANCELLED,
        { orderId, reason },
        `user:${userId}`,
        wsConfig.namespaces.ORDERS
      );
      
      logger.info(`Processed cancellation for order ${orderId}`);
    } catch (error) {
      logger.error('Error handling order cancelled event:', error);
    }
  }
}

// Initialize handlers
export default new OrderEventHandlers();

