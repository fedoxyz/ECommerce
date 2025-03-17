import Queue from 'bull';
import RedisConfig from '../../configs/redis.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../../utils/logger.js';
import * as jobTypesModule from './jobTypes.js';

/**
 * JobScheduler Class
 * - Manages multiple Bull job queues
 * - Handles job scheduling, processing, and state changes
 */
class JobScheduler {
  constructor() {
    // Map to store queues
    this.queues = new Map();

    // Map to store job handlers per queue
    this.handlers = new Map();

    this.initQueues();
  }

  /**
   * Extracts queue names from job definitions and initializes them.
   */
  initQueues() {
    const jobTypes = Object.assign({}, ...Object.values(jobTypesModule));
    const queueNames = new Set(
      Object.values(jobTypes).map((jobType) => jobType.split(":")[0])
    );

    queueNames.forEach((queueName) => {
      var queue = new Queue(queueName, {
        redis: RedisConfig.createQueueClient(),
      });
      queue.process('*', (job) => this.processJob(queueName, job));
      queue.on('completed', (job) => this.handleJobCompleted(queueName, job));
      queue.on('failed', (job, error) => this.handleJobFailed(queueName, job, error));
      this.queues.set(queueName, queue);
      this.handlers.set(queueName, new Map());
      this.loadHandlers(queueName);
    });

    logger.info(`Initialized queues: ${[...queueNames].join(", ")}`);
  }

  /**
   * Get or create a queue by name
   * @param {string} queueName - Name of the queue
   * @returns {Queue} - Bull queue instance
   */
  getQueue(queueName) {
    return this.queues.get(queueName);
  }

  /**
   * Dynamically load handlers for a specific queue
   * @param {string} queueName - Name of the queue
   */
  async loadHandlers(queueName) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const handlersFolder = path.resolve(__dirname, 'handlers'); // Folder per queue

    try {
      if (!fs.existsSync(handlersFolder)) return;
      logger.debug("Trying load handlers")
      const files = fs.readdirSync(handlersFolder);
      const queueHandlers = this.handlers.get(queueName);

      for (const file of files) {
        if (file.endsWith('.js') && file.startsWith(queueName + '.')) {
          logger.debug("found file")
          const handlerPath = path.resolve(handlersFolder, file);
          const handlerModule = await import(handlerPath);

          if (handlerModule.default) {
            for (const [eventType, handler] of Object.entries(handlerModule.default)) {
              queueHandlers.set(eventType, handler);
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error loading handlers for queue ${queueName}:`, error);
    }
  }

  /**
   * Schedule a job to a specific queue
   * @param {string} queueName - Queue name
   * @param {string} jobType - Job type
   * @param {Object} payload - Job data
   * @param {Date} datetime - When to run the job
   * @param {number} attempts - Max retry attempts
   * @returns {Promise<string>} - Job ID
   */
  async scheduleJob(jobType, payload, datetime, attempts = 3) {
    logger.debug(`Scheduling job in queue: ${jobType.split(":")[0]}, Type: ${jobType}`);
    
    const queueName = jobType.split(":")[0];
    const now = new Date();
    const targetDate = new Date(datetime);
    const delay = Math.max(0, targetDate.getTime() - now.getTime());

    const queue = this.getQueue(queueName);
    const job = await queue.add(
      jobType,
      { jobType, payload },
      {
        delay,
        attempts,
        backoff: { type: 'exponential', delay: 1000 },
      }
    );
    return job.id;
  }

  /**
   * Process a job from a specific queue
   * @param {string} queueName - Queue name
   * @param {Object} job - Bull job object
   */
  async processJob(queueName, job) {
    const { jobType, payload } = job.data;
    const handlers = this.handlers.get(queueName);
    const handler = handlers?.get(jobType);

    if (handler) {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`Job ${job.id} in queue ${queueName} failed: ${error.message}`);
      }
    } else {
      logger.warn(`No handler for job type: ${jobType} in queue: ${queueName}`);
    }
  }

  /**
   * Handle job completion
   * @param {string} queueName - Queue name
   * @param {Object} job - Bull job object
   */
  handleJobCompleted(queueName, job) {
    logger.info(`Job completed in queue ${queueName}: ${job.id} - Type: ${job.name}`);
  }

  /**
   * Handle job failure
   * @param {string} queueName - Queue name
   * @param {Object} job - Bull job object
   * @param {Error} error - Error message
   */
  handleJobFailed(queueName, job, error) {
    logger.error(`Job failed in queue ${queueName}: ${job.id} - Type: ${job.name} - Error: ${error.message}`);
  }

  /**
   * Register a handler for a job type in a specific queue
   * @param {string} queueName - Queue name
   * @param {string} jobType - Job type
   * @param {Function} handler - Job handler function
   */
  registerHandler(queueName, jobType, handler) {
    const queueHandlers = this.handlers.get(queueName) || new Map();
    queueHandlers.set(jobType, handler);
    this.handlers.set(queueName, queueHandlers);
    logger.info(`Registered handler for ${jobType} in queue ${queueName}`);
  }

  /**
   * Cancel a job by ID in a specific queue
   * @param {string} queueName - Queue name
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} - Success status
   */
  async cancelJob(queueName, jobId) {
    logger.debug(`Attempting to cancel job ${jobId} in queue ${queueName}`);
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.getJob(jobId);

      if (!job) {
        logger.warn(`Job ${jobId} not found in queue ${queueName}`);
        return false;
      }

      const state = await job.getState();
      if (['completed', 'failed', 'active'].includes(state)) {
        logger.info(`Job ${jobId} is ${state}, cannot be cancelled`);
        return false;
      }

      await job.remove();
      logger.info(`Successfully cancelled job ${jobId} in queue ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Error cancelling job ${jobId} in queue ${queueName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for a job by ID across all queues or in a specific queue
   * @param {string} jobId - Job ID to search for
   * @param {string} [queueName] - Optional queue name to search in
   * @returns {Promise<Object|null>} - Job status object or null if not found
   */
  async getJobStatus(jobId, queueName = null) {
    logger.debug(`Searching for job ${jobId}${queueName ? ` in queue ${queueName}` : ' across all queues'}`);
    
    try {
      // If queue name is provided, search only in that queue
      if (queueName) {
        const queue = this.getQueue(queueName);
        if (!queue) {
          logger.warn(`Queue ${queueName} not found`);
          return null;
        }
        return await this._getJobStatusFromQueue(queue, jobId);
      }
      
      // Otherwise search across all queues
      for (const [queueName, queue] of this.queues.entries()) {
        const jobStatus = await this._getJobStatusFromQueue(queue, jobId);
        if (jobStatus) {
          return {
            ...jobStatus,
            queueName
          };
        }
      }
      
      logger.warn(`Job ${jobId} not found in any queue`);
      return null;
    } catch (error) {
      logger.error(`Error searching for job ${jobId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Helper method to get job status from a specific queue
   * @param {Queue} queue - Bull queue instance
   * @param {string} jobId - Job ID
   * @returns {Promise<Object|null>} - Job status object or null if not found
   */
  async _getJobStatusFromQueue(queue, jobId) {
    const job = await queue.getJob(jobId);
    
    if (!job) {
      return false;
    }
    
    const state = await job.getState();
    const progress = await job.progress();
    const { jobType, payload } = job.data;
    
    return {
      id: job.id,
      type: jobType,
      status: state,
      progress,
      isDelayed: state === 'delayed',
      isCompleted: state === 'completed',
      isFailed: state === 'failed',
      isScheduled: ['delayed', 'waiting'].includes(state),
      isActive: state === 'active',
      createdAt: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      attempts: job.attemptsMade,
      data: payload
    };
  }
}

export default new JobScheduler();

