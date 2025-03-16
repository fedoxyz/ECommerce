import app from './app.js';
import sequelize from './configs/database.js';
import logger from './utils/logger.js';
import JobScheduler from './services/queue/scheduler.js';
import { createBullBoard } from '@bull-board/api';  
import { BullAdapter } from '@bull-board/api/bullAdapter.js';  
import { ExpressAdapter } from '@bull-board/express'; 


const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function initializeDatabase() {
  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection has been established successfully.');

      // Sync models and refresh the database if in development mode
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ force: true }); // force: true will drop the existing tables
        logger.info('Database has been synced!');
      }
      return;
    } catch (error) {
      logger.error(`Unable to initialize the database (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
      retries -= 1;
      if (retries === 0) {
        throw error; // Throw error if all retries are exhausted
      }
      logger.info(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}


async function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      resolve(server);
    });

    server.on('error', (error) => {
      logger.error('Failed to start server:', error);
      reject(error);
    });
  });
}

async function initialize() {
  try {
    await initializeDatabase();
    await startServer();
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

