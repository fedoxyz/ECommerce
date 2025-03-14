// src/utils/cache.js
import NodeCache from 'node-cache';

class CacheService {
  constructor(ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    });
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = undefined) {
    return this.cache.set(key, value, ttl);
  }

  del(keys) {
    return this.cache.del(keys);
  }

  flush() {
    return this.cache.flushAll();
  }

  keys() {
    return this.cache.keys();
  }

  stats() {
    return this.cache.getStats();
  }
}

// Create a cache service instance with default TTL of 60 seconds
const cacheService = new CacheService(60);

export default cacheService;

