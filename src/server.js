import app from './app.js';
import logger from './utils/logger.js';
import WebSocketService from './services/websocket/socket.js';
import { initializeDatabase } from './configs/database.js';

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, HOST, () => {
      logger.info(`Server is running on port ${PORT}`);
      resolve(server);
    });

    server.on('error', (error) => {
      logger.error('Failed to start server:', error);
      reject(error);
    });

    return server;
  });
}

async function initialize() {
  try {
    logger.info("Initializing application");
    await initializeDatabase();
    const server = await startServer();
    WebSocketService.initialize(server);
    logger.info('Application initialized successfully.');
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

(async () => {
  try {
    await initialize();
  } catch (error) {
    logger.error('Unhandled error during initialization:', error);
    process.exit(1);
  }
})();

