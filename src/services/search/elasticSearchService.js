import { Client } from '@elastic/elasticsearch';
import config from '../../configs/elasticsearch';
import logger from '../../utils/logger';
class ElasticSearchService {
  constructor() {
    this.client = new Client({
      node: config.node,
      auth: {
        username: config.username,
        password: config.password
      },
      maxRetries: config.maxRetries,
      requestTimeout: config.requestTimeout,
      sniffOnStart: config.sniffOnStart
    });
    this.productIndex = config.indices.products;
  }

  async initialize() {
    try {
      const indexExists = await this.client.indices.exists({
        index: this.productIndex
      });

      if (!indexExists) {
        await this.createProductIndex();
        logger.info(`Created ${this.productIndex} index in Elasticsearch`);
      } else {
        logger.info(`${this.productIndex} index already exists in Elasticsearch`);
      }
      return true;
    } catch (error) {
      logger.error(`Failed to initialize Elasticsearch: ${error.message}`);
      return false;
    }
  }

  async createProductIndex() {
    return this.client.indices.create({
      index: this.productIndex,
      body: {
        settings: {
          number_of_shards: config.settings.shards,
          number_of_replicas: config.settings.replicas,
          refresh_interval: config.settings.refreshInterval,
          analysis: {
            analyzer: {
              product_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'trim', 'word_delimiter']
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { 
              type: 'text',
              analyzer: 'product_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                completion: { type: 'completion' }
              }
            },
            description: { 
              type: 'text', 
              analyzer: 'product_analyzer' 
            },
            price: { type: 'float' },
            categoryId: { type: 'keyword' },
            categoryName: { type: 'keyword' },
            tags: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            embedding: { 
              type: 'dense_vector',
              dims: 768,
              index: false 
            }
          }
        }
      }
    });
  }

  async indexProduct(product) {
    try {
      await this.client.index({
        index: this.productIndex,
        id: product.id.toString(),
        body: {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          categoryId: product.categoryId,
          categoryName: product.Category ? product.Category.name : null,
          tags: product.tags || [],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        },
        refresh: true // Set to true to make the document available immediately
      });
      logger.info(`Indexed product ${product.id} in Elasticsearch`);
      return true;
    } catch (error) {
      logger.error(`Failed to index product ${product.id}: ${error.message}`);
      return false;
    }
  }

  async bulkIndexProducts(products) {
    if (!products.length) return { errors: false };

    try {
      const operations = products.flatMap(product => [
        { index: { _index: this.productIndex, _id: product.id.toString() } },
        {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          categoryId: product.categoryId,
          categoryName: product.Category ? product.Category.name : null,
          tags: product.tags || [],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      ]);

      const response = await this.client.bulk({
        refresh: true,
        body: operations
      });

      if (response.errors) {
        logger.error('Bulk indexing encountered errors', response.items);
      } else {
        logger.info(`Successfully bulk indexed ${products.length} products`);
      }

      return response;
    } catch (error) {
      logger.error(`Bulk indexing failed: ${error.message}`);
      throw error;
    }
  }

  async removeProduct(productId) {
    try {
      await this.client.delete({
        index: this.productIndex,
        id: productId.toString(),
        refresh: true
      });
      logger.info(`Removed product ${productId} from Elasticsearch`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove product ${productId}: ${error.message}`);
      return false;
    }
  }

  async searchProducts(searchQuery, filters = {}, page = 1, limit = 10) {
    const from = (page - 1) * limit;
    
    // Build the base query
    const query = {
      bool: {
        must: [],
        filter: []
      }
    };

    // Add text search if provided
    if (searchQuery && searchQuery.trim() !== '') {
      query.bool.must.push({
        multi_match: {
          query: searchQuery,
          fields: ['name^3', 'description^2', 'categoryName', 'tags'],
          type: 'best_fields',
          fuzziness: 'AUTO',
          prefix_length: 2
        }
      });
    } else {
      // If no search term, match all documents
      query.bool.must.push({ match_all: {} });
    }

    // Add filters
    if (filters.categoryId) {
      query.bool.filter.push({
        term: { categoryId: filters.categoryId }
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const rangeFilter = { range: { price: {} } };
      if (filters.minPrice !== undefined) {
        rangeFilter.range.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        rangeFilter.range.price.lte = filters.maxPrice;
      }
      query.bool.filter.push(rangeFilter);
    }

    if (filters.tags && filters.tags.length) {
      query.bool.filter.push({
        terms: { tags: filters.tags }
      });
    }

    try {
      const response = await this.client.search({
        index: this.productIndex,
        body: {
          query,
          sort: [
            // If there's a search query, sort by relevance (default)
            // Otherwise sort by recency
            ...(searchQuery ? [] : [{ createdAt: { order: 'desc' } }])
          ],
          from,
          size: limit,
          // Include highlighted matches in results
          highlight: {
            fields: {
              name: {},
              description: {}
            },
            pre_tags: ['<strong>'],
            post_tags: ['</strong>'],
            fragment_size: 150,
            number_of_fragments: 3
          }
        }
      });

      const hits = response.hits.hits;
      const totalItems = response.hits.total.value;

      // Format the results
      const products = hits.map(hit => {
        const source = hit._source;
        return {
          ...source,
          score: hit._score,
          highlights: hit.highlight || {}
        };
      });

      return {
        products,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page
      };
    } catch (error) {
      logger.error(`Search error: ${error.message}`);
      throw error;
    }
  }

  async refreshIndex() {
    return this.client.indices.refresh({ index: this.productIndex });
  }

  async healthCheck() {
    try {
      const health = await this.client.cluster.health();
      return health.status !== 'red';
    } catch (error) {
      logger.error(`Elasticsearch health check failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = ElasticSearchService;
