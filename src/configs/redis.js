import Redis from 'ioredis';

/**
 * Redis configuration and client factory
 * Creates and configures Redis clients for different purposes
 */
class RedisConfig {
  /**
   * Creates a standard Redis client
   * @param {Object} options - Override default options
   * @returns {Redis} - Redis client instance
   */
  static createClient(options = {}) {
    return new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
  }

  /**
   * Creates a specialized client for job queue operations (Bull)
   * @returns {Redis} - Redis client instance configured for job queue
   */
  static createQueueClient() {
    return this.createClient({
      maxRetriesPerRequest: null,
      enableOfflineQueue: true
    });
  }
}

export default RedisConfig;

