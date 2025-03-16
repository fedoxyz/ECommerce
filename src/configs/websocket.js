/**
 * WebSocket configuration
 * Central configuration for WebSocket settings
 */
const websocketConfig = {
  // Socket.IO specific options
  socketOptions: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 30000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true
  },

  // Custom namespaces
  namespaces: {
    MAIN: '/',
    NOTIFICATIONS: '/notifications',
    ORDERS: '/orders',
    CART: '/cart',
    PRODUCTS: '/products'
  },

  // Event types
  events: {
    // Connection events
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
    
    // Notification events
    NOTIFICATION_NEW: 'notification:new',
    NOTIFICATION_READ: 'notification:read',
    
    // Order events
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    ORDER_STATUS_CHANGED: 'order:status_changed',
    
    // Cart events
    CART_UPDATED: 'cart:updated',
    CART_ITEM_ADDED: 'cart:item_added',
    CART_ITEM_REMOVED: 'cart:item_removed',
    
    // Product events
    PRODUCT_STOCK_CHANGE: 'product:stock_change',
    PRODUCT_PRICE_CHANGE: 'product:price_change',
  },

  // Redis channel names for pub/sub
  redisChannels: {
    SOCKET_EVENTS: 'socket:events',
    NOTIFICATIONS: 'notifications',
    ORDERS: 'orders',
    CART: 'cart',
    PRODUCTS: 'products'
  }
};

export default websocketConfig;
