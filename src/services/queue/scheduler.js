import Queue from 'bull';
import EventEmitter from './events/emitter.js';
import RedisConfig from '../../configs/redis.js';
import path from 'path';
import fs from 'fs';
import { JOB_EVENTS } from './events/types.js';
import { fileURLToPath } from 'url';

/**
 * JobScheduler Class
 * - Manages Bull job queue
 * - Handles job scheduling, processing, and state changes
 */
class JobScheduler {
  constructor() {
    // Initialize Bull Queue with Redis config
    this.queue = new Queue('job_scheduler', {
      redis: RedisConfig.createQueueClient()
    });
    
    // Map to store job handlers
    this.handlers = new Map();
    
    // Custom EventEmitter for job state changes
    this.eventEmitter = EventEmitter;

    // Process jobs using Bull queue
    this.queue.process(this.processJob.bind(this));

    // Listen to Bull's internal events
    this.queue.on('completed', this.handleJobCompleted.bind(this));
    this.queue.on('failed', this.handleJobFailed.bind(this));

    // Register handlers from the handlers folder
    this.loadHandlers();
  }

  /**
   * Dynamically load handlers from the 'handlers' folder
   */
  loadHandlers() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const handlersFolder = path.resolve(__dirname, 'events', 'handlers');
    const files = fs.readdirSync(handlersFolder);

    files.forEach(async (file) => {
      const handlerPath = path.resolve(handlersFolder, file);

      // Dynamically import each handler using ES module syntax
      const handlerModule = await import(handlerPath);
      const handler = handlerModule.default;

      // Register the handler based on job type (file name)
      const jobType = file.replace('.js', '');
      this.registerHandler(jobType, handler);
    });

  }

  /**
   * Schedule a job to run after a delay
   * @param {string} jobType - Type of job to schedule
   * @param {Object} payload - Job data
   * @param {number} delayInSeconds - Delay in seconds
   * @returns {Promise<string>} - Job ID
   */
  async scheduleJob(jobType, payload, delayInSeconds) {
    const job = await this.queue.add(
      { jobType, payload },
      { delay: delayInSeconds * 1000 }
    );
    this.eventEmitter.emit(JOB_EVENTS.SCHEDULED, { jobId: job.id, jobType });
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
        this.eventEmitter.emit(JOB_EVENTS.COMPLETED, { jobId: job.id, jobType });
      } catch (error) {
        this.eventEmitter.emit(JOB_EVENTS.FAILED, { jobId: job.id, jobType, error: error.message });
      }
    } else {
      this.eventEmitter.emit(JOB_EVENTS.UNHANDLED, { jobId: job.id, jobType });
    }
  }

  /**
   * Handle job completion (via Bull's internal event)
   * @param {Object} job - Bull job object
   */
  handleJobCompleted(job) {
    this.eventEmitter.emit(JOB_EVENTS.COMPLETED, { jobId: job.id, jobType: job.name });
  }

  /**
   * Handle job failure (via Bull's internal event)
   * @param {Object} job - Bull job object
   * @param {Error} error - Error message
   */
  handleJobFailed(job, error) {
    this.eventEmitter.emit(JOB_EVENTS.FAILED, { jobId: job.id, jobType: job.name, error: error.message });
  }

  /**
   * Register a handler for a job type
   * @param {string} jobType - Job type
   * @param {Function} handler - Job handler function
   */
  registerHandler(jobType, handler) {
    this.handlers.set(jobType, handler);
  }
}

export default new JobScheduler();
