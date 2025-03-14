import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

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

// Sync models and refresh the database if in development mode
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ force: false }) // force: true will drop the existing tables
    .then(() => {
      console.log('Database has been synced!');
    })
    .catch((error) => {
      console.error('Error syncing database:', error);
    });
}

export default sequelize;

