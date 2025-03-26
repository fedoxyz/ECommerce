import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { swaggerUi, swaggerDocs } from './configs/swagger.js';
import apiRoutes from './api/routes/index.js';
import JobScheduler from './services/queue/scheduler.js'; 
import { createBullBoard } from '@bull-board/api';  
import { BullAdapter } from '@bull-board/api/bullAdapter.js';  
import { ExpressAdapter } from '@bull-board/express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

app.use(cors());

app.use(helmet());

// Explicitly set to use HTTP
app.use((req, res, next) => {
  // Force HTTP if unintended HTTPS
  if (req.protocol === 'https') {
    return res.redirect(`http://${req.headers.host}${req.url}`);
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX || 1000, // 100 requests per window by default
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API routes
app.use('/api', apiRoutes);

app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Setup BullBoard UI for job management (separate from API routes)
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');  // Customize the URL path for BullBoard UI

// Automatically register all queues
const bullAdapters = Array.from(JobScheduler.queues.values()).map(
  (queue) => new BullAdapter(queue)
);

createBullBoard({
  queues: bullAdapters,
  serverAdapter,
});


// Serve BullBoard UI at /admin/queues
app.use('/admin/queues', serverAdapter.getRouter());


// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Commerce API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
});

export default app;
