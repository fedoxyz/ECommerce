import morgan from 'morgan';
import logger from '../utils/logger.js';

// Create a custom token for morgan to use request ID
morgan.token('request-id', (req) => req.id);

// Create a stream object with a 'write' function that will call the logger
const stream = {
  write: (message) => logger.http(message.trim())
};

const loggerMiddleware = morgan(
  ':request-id :remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream }
);

export default loggerMiddleware;

