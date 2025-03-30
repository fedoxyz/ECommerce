const config = {
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  username: process.env.ELASTICSEARCH_USERNAME || '',
  password: process.env.ELASTICSEARCH_PASSWORD || '',
  indices: {
    products: 'products',
  },
  settings: {
    shards: 3,
    replicas: 1,
    refreshInterval: '1s'
  },
  maxRetries: 5,
  requestTimeout: 30000,
  sniffOnStart: true
};

export default config;
