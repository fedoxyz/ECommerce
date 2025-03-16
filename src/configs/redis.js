import Redis from 'ioredis';

/**
 * Redis configuration and client factory
 * Creates and configures Redis clients for different purposes
 */
class RedisConfig {
  static getDefaultOptions() {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    };
  }

  /**
   * Creates a standard Redis client
   * @param {Object} options - Override default options
   * @returns {Redis} - Redis client instance
   */
  static createClient(options = {}) {
    return new Redis({
      ...this.getDefaultOptions(),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      ...options
    });
  }

  static createQueueClient() {
    return this.getDefaultOptions();
  }
}

export default RedisConfig;
