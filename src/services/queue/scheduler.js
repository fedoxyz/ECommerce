import Queue from 'bull';
import RedisConfig from '../../configs/redis.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../../utils/logger.js';

/**
 * JobScheduler Class
 * - Manages Bull job queue
 * - Handles job scheduling, processing, and state changes
 */
class JobScheduler {
  constructor() {
    // Initialize Bull Queue with Redis config
    this.queue = new Queue('job_scheduler', {
      redis: RedisConfig.createQueueClient(),
    });

    // Map to store job handlers
    this.handlers = new Map();

    // Process jobs using Bull queue
    this.queue.process('*', this.processJob.bind(this));

    // Listen to Bull's internal events
    this.queue.on('completed', this.handleJobCompleted.bind(this));
    this.queue.on('failed', this.handleJobFailed.bind(this));

    // Register handlers from the handlers folder
    this.loadHandlers();
  }

  /**
   * Dynamically load handlers from the 'handlers' folder
   */
  async loadHandlers() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const handlersFolder = path.resolve(__dirname, 'handlers');

    try {
      const files = fs.readdirSync(handlersFolder);

      for (const file of files) {
        logger.debug(file)
        if (file.endsWith('.js')) {
          const handlerPath = path.resolve(handlersFolder, file);
          const handlerModule = await import(handlerPath);

          if (handlerModule.default) {
            const handlers = handlerModule.default;
            for (const [eventType, handler] of Object.entries(handlers)) {
              this.registerHandler(eventType, handler);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error loading handlers:', error);
    }
  }

  /**
   * Schedule a job to run after a delay
   * @param {string} jobType - Type of job to schedule
   * @param {Object} payload - Job data
   * @param {number} delayInSeconds - Delay in seconds
   * @returns {Promise<string>} - Job ID
   */
  async scheduleJob(jobType, payload, datetime, attempts=3) {
    logger.debug(`Scheduling job: ${jobType} with payload: ${JSON.stringify(payload)} Datetime: ${datetime}`);

    const now = new Date();
    const targetDate = new Date(datetime);
    const delta = targetDate.getTime() - now.getTime();
    
    const delayInSeconds = Math.max(0, Math.floor(delta / 1000));
    const job = await this.queue.add(
      jobType,                  
      { jobType, payload },     
      { 
        delay: delayInSeconds * 1000,
        attempts: attempts,              
        backoff: {                
          type: 'exponential',
          delay: 1000          
        }
      }
    );
    return job.id;
  }

  /**
   * Process a job from the queue
   * @param {Object} job - Bull job object
   */
  async processJob(job) {
    const { jobType, payload } = job.data;
    const handler = this.handlers.get(jobType);

    if (handler) {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`Job ${job.id} failed:`, error.message);
      }
    } else {
      logger.warn(`No handler registered for job type: ${jobType}`);
    }
  }

  /**
   * Handle job completion (via Bull's internal event)
   * @param {Object} job - Bull job object
   */
  handleJobCompleted(job) {
    logger.info(`Job completed: ${job.id} - Type: ${job.name}`);
  }

  /**
   * Handle job failure (via Bull's internal event)
   * @param {Object} job - Bull job object
   * @param {Error} error - Error message
   */
  handleJobFailed(job, error) {
    console.error(`Job failed: ${job.id} - Type: ${job.name} - Error: ${error.message}`);
  }

  /**
   * Register a handler for a job type
   * @param {string} jobType - Job type
   * @param {Function} handler - Job handler function
   */
  registerHandler(jobType, handler) {
    this.handlers.set(jobType, handler);
    console.log(`Registered handler for event: ${jobType}`);
  }

  async cancelJob(jobId) {
    logger.debug(`Attempting to cancel job with ID: ${jobId}`);
    try {
      const job = await this.queue.getJob(jobId);
      
      if (!job) {
        logger.warn(`Job with ID ${jobId} not found in queue`);
        return false;
      }
      
      // Check if job is still waiting or delayed
      const state = await job.getState();
      
      if (state === 'completed' || state === 'failed' || state === 'active') {
        logger.info(`Job ${jobId} is already in state ${state}, cannot be cancelled`);
        return false;
      }
      
      // Remove the job from the queue
      await job.remove();
      logger.info(`Successfully cancelled job ${jobId}`);
      return true;
    } catch (error) {
      logger.error(`Error cancelling job ${jobId}: ${error.message}`);
      throw error;
    }
  }
}

export default new JobScheduler();

