/**
 * Business Configuration
 * Contains all business logic variables that might need to be modified by clients
 * or administrators in the future.
 */

const businessConfig = {
  // Cart related configurations
  cart: {
    // Expiration time as a function that returns a Date object (30 minutes from now)
    expirationTime: () => new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    maxItems: 50,
  },
  
  // Order related configurations
  order: {
    // Expiration time as a function that returns a Date object (1 hour from now)
    pendingExpirationTime: () => new Date(Date.now() + 60 * 60 * 60 * 1000), // 1 hour
  },
  
  // Product related configurations
  product: {
    lowStockThreshold: 5,
  },
};

export default businessConfig;

