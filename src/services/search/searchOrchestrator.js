import ElasticSearchService from './elasticSearchService';
import redisClient from '../../configs/redis'
import logger from '../../utils/logger';

class SearchOrchestrator {
  constructor() {
    this.elasticSearchService = new ElasticSearchService();
    this.cacheEnabled = process.env.ENABLE_SEARCH_CACHE === 'true';
    this.cacheTTL = parseInt(process.env.SEARCH_CACHE_TTL || '300', 10); // 5 minutes default
  }

  async initialize() {
    return this.elasticSearchService.initialize();
  }

  /**
   * Search for products with caching layer
   */
  async searchProducts(searchQuery, filters = {}, page = 1, limit = 10) {
    // Generate a cache key based on search parameters
    const cacheKey = this._generateCacheKey(searchQuery, filters, page, limit);
    
    // Try to get results from cache first
    if (this.cacheEnabled) {
      try {
        const cachedResults = await redisClient.get(cacheKey);
        if (cachedResults) {
          logger.debug('Search cache hit', { searchQuery, filters });
          return JSON.parse(cachedResults);
        }
      } catch (error) {
        logger.warn('Error retrieving from cache:', error.message);
        // Continue with search if cache fails
      }
    }

    // If no cache hit, perform the search
    try {
      const results = await this.elasticSearchService.searchProducts(
        searchQuery, 
        filters, 
        page, 
        limit
      );
      
      // Cache the results
      if (this.cacheEnabled) {
        try {
          await redisClient.set(
            cacheKey, 
            JSON.stringify(results), 
            'EX', 
            this.cacheTTL
          );
        } catch (error) {
          logger.warn('Error caching search results:', error.message);
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Search failed:', error.message);
      // Return empty results on error
      return {
        products: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      };
    }
  }

  async getSuggestions(prefix, limit = 5) {
    // For autocomplete, we use a shorter cache TTL
    const cacheKey = `suggestions:${prefix}:${limit}`;
    
    if (this.cacheEnabled) {
      try {
        const cachedResults = await redisClient.get(cacheKey);
        if (cachedResults) {
          return JSON.parse(cachedResults);
        }
      } catch (error) {
        logger.warn('Error retrieving suggestions from cache:', error.message);
      }
    }
    
    try {
      const suggestions = await this.elasticSearchService.getSuggestions(prefix, limit);
      
      if (this.cacheEnabled) {
        try {
          // Shorter TTL for suggestions
          await redisClient.set(
            cacheKey, 
            JSON.stringify(suggestions), 
            'EX', 
            60 // 1 minute TTL
          );
        } catch (error) {
          logger.warn('Error caching suggestions:', error.message);
        }
      }
      
      return suggestions;
    } catch (error) {
      logger.error('Getting suggestions failed:', error.message);
      return [];
    }
  }

  async indexProduct(product) {
    // Clear relevant caches when indexing a product
    if (this.cacheEnabled) {
      try {
        await this._invalidateProductCache(product);
      } catch (error) {
        logger.warn('Error invalidating cache:', error.message);
      }
    }
    
    return this.elasticSearchService.indexProduct(product);
  }

  async bulkIndexProducts(products) {
    // Clear cache for bulk operations
    if (this.cacheEnabled && products.length > 0) {
      try {
        await this._invalidateCategoryCache(products[0].categoryId);
      } catch (error) {
        logger.warn('Error invalidating category cache:', error.message);
      }
    }
    
    return this.elasticSearchService.bulkIndexProducts(products);
  }

  async removeProduct(productId, categoryId) {
    // Clear caches for the removed product
    if (this.cacheEnabled) {
      try {
        await this._invalidateProductCacheById(productId, categoryId);
      } catch (error) {
        logger.warn('Error invalidating cache for removed product:', error.message);
      }
    }
    
    return this.elasticSearchService.removeProduct(productId);
  }

  async healthCheck() {
    return this.elasticSearchService.healthCheck();
  }

  // Private methods for cache management
  
  _generateCacheKey(searchQuery, filters, page, limit) {
    const normalizedQuery = (searchQuery || '').toLowerCase().trim();
    const filterString = JSON.stringify(filters || {});
    return `search:${normalizedQuery}:${filterString}:${page}:${limit}`;
  }

  async _invalidateProductCache(product) {
    const patterns = [
      `search:*:*"categoryId":"${product.categoryId}"*:*:*`,
      // Other patterns that might include this product
      `search:${product.name.toLowerCase().substring(0, 3)}*:*:*:*`
    ];
    
    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      if (keys.length) {
        await redisClient.del(keys);
        logger.debug(`Invalidated ${keys.length} cache keys for product ${product.id}`);
      }
    }
  }

  async _invalidateProductCacheById(productId, categoryId) {
    // Similar to above but when we only have the ID
    const patterns = [
      `search:*:*"categoryId":"${categoryId}"*:*:*`
    ];
    
    for (const pattern of patterns) {
      const keys = await redisClient.keys(pattern);
      if (keys.length) {
        await redisClient.del(keys);
        logger.debug(`Invalidated ${keys.length} cache keys for removed product ${productId}`);
      }
    }
  }

  async _invalidateCategoryCache(categoryId) {
    const pattern = `search:*:*"categoryId":"${categoryId}"*:*:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length) {
      await redisClient.del(keys);
      logger.debug(`Invalidated ${keys.length} cache keys for category ${categoryId}`);
    }
  }
}

module.exports = SearchOrchestrator;
