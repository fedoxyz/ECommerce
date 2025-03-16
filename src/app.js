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

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX || 100, // 100 requests per window by default
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

// API routes
app.use('/api', apiRoutes);

// Setup BullBoard UI for job management (separate from API routes)
const jobSchedulerQueue = JobScheduler.queue;  // Use the queue from your JobScheduler
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');  // Customize the URL path for BullBoard UI

createBullBoard({
  queues: [new BullAdapter(jobSchedulerQueue)],  // Add your Bull queue here
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
