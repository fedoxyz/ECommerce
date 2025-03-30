import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

export async function initializeDatabase() {
  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection has been established successfully.');
      break; // Exit loop once connected
    } catch (error) {
      logger.error(`Unable to connect to the database (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
      retries -= 1;
      if (retries === 0) {
        throw error; // Stop retrying after max attempts
      }
      logger.info(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  if (process.env.NODE_ENV === 'development') {
    await sequelize.sync({
      force : false , // To create table if exists , so make it false
      alter : true // To update the table if exists , so make it true
    })    
    logger.info('Database has been synced!');
    
  }
}

export default sequelize;

