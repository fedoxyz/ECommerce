export const JOB_EVENTS = {
  SCHEDULED: 'job:scheduled',
  COMPLETED: 'job:completed',
  FAILED: 'job:failed',
  CANCELLED: 'job:cancelled',
  UNHANDLED: 'job:unhandled',
};

/**
 * Event type definitions
 * Central registry of all event types used in the application
 */
export const SYSTEM_EVENTS = {
  SYSTEM_STARTUP: 'system:startup',
  SYSTEM_SHUTDOWN: 'system:shutdown',
  SYSTEM_ERROR: 'system:error'
};

export const USER_EVENTS = {
  USER_REGISTERED: 'user:registered',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
};

export const PRODUCT_EVENTS = {
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  PRODUCT_STOCK_CHANGED: 'product:stock_changed',
  PRODUCT_PRICE_CHANGED: 'product:price_changed',
};

export const ORDER_EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_PAYMENT_PROCESSED: 'order:payment_processed',
  ORDER_SHIPPED: 'order:shipped',
  ORDER_DELIVERED: 'order:delivered',
  ORDER_CANCELLED: 'order:cancelled',
};

export const CART_EVENTS = {
  CART_CREATED: 'cart:created',
  CART_UPDATED: 'cart:updated',
  CART_ITEM_ADDED: 'cart:item_added',
  CART_ITEM_REMOVED: 'cart:item_removed',
  CART_ABANDONED: 'cart:abandoned',
};

export const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: 'payment:initiated',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
  PAYMENT_REFUNDED: 'payment:refunded',
};

export const NOTIFICATION_EVENTS = {
  NOTIFICATION_CREATED: 'notification:created',
  NOTIFICATION_DELIVERED: 'notification:delivered',
  NOTIFICATION_READ: 'notification:read'
};

export const ALL_EVENTS = {
  ...JOB_EVENTS,
  ...SYSTEM_EVENTS,
  ...USER_EVENTS,
  ...PRODUCT_EVENTS,
  ...ORDER_EVENTS,
  ...CART_EVENTS,
  ...PAYMENT_EVENTS,
  ...NOTIFICATION_EVENTS
};

