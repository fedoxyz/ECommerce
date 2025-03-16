import { Server } from 'socket.io';
import wsConfig from '../../configs/websocket.js';
import logger from '../../utils/logger.js';
import JobScheduler from '../../services/queue/scheduler.js';  // Assuming this is where you define Bull queues

class WebSocketService {
  constructor() {
    this.io = null;
    this.handlers = new Map();
    this.namespaces = new Map();
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = Server(server, wsConfig.socketOptions);

    // Set up main namespace
    const mainNamespace = this.io.of(wsConfig.namespaces.MAIN);
    this.setupNamespace(mainNamespace);
    this.namespaces.set(wsConfig.namespaces.MAIN, mainNamespace);

    // Set up additional namespaces
    Object.entries(wsConfig.namespaces).forEach(([key, namespace]) => {
      if (namespace === wsConfig.namespaces.MAIN) return;

      const ns = this.io.of(namespace);
      this.setupNamespace(ns);
      this.namespaces.set(namespace, ns);
    });

    // Subscribe to Bull job events
    this.subscribeToBullEvents();

    logger.info('WebSocket service initialized');
  }

  /**
   * Set up event handlers for a namespace
   * @param {Object} namespace - Socket.IO namespace
   */
  setupNamespace(namespace) {
    namespace.on(wsConfig.events.CONNECTION, (socket) => {
      logger.info(`Client connected to ${namespace.name}`);

      // Handle authentication
      this.handleAuthentication(socket);

      // Handle disconnection
      socket.on(wsConfig.events.DISCONNECT, () => {
        logger.warning(`Client disconnected from ${namespace.name}`);
      });

      // Handle errors
      socket.on(wsConfig.events.ERROR, (error) => {
        logger.error(`Socket error in ${namespace.name}:`, error);
      });
    });
  }

  /**
   * Handle client authentication
   * @param {Object} socket - Socket.IO socket
   */
  handleAuthentication(socket) {
    const token = socket.handshake.auth.token;
    if (!token) {
      // Allow anonymous connections but restrict to public rooms
      socket.join('public');
      return;
    }

    const userId = 'user-123';  // Replace with actual user ID from token
    socket.join(`user:${userId}`);
    socket.data.userId = userId;
    socket.data.authenticated = true;
  }

  /**
   * Subscribe to Bull job events
   * Here we listen to events like 'completed', 'failed', etc.
   */
  subscribeToBullEvents() {
    const jobSchedulerQueue = JobScheduler.queue; // Access the Bull queue from JobScheduler

    // Listen for job completion events in Bull
    jobSchedulerQueue.on('completed', (job, result) => {
      this.handleBullJobEvent('completed', job, result);
    });

    // Listen for job failure events in Bull
    jobSchedulerQueue.on('failed', (job, error) => {
      this.handleBullJobEvent('failed', job, error);
    });

    // Add more Bull events if needed (e.g., 'stalled', 'progress', etc.)
  }

  /**
   * Handle Bull job events and emit to clients via WebSocket
   * @param {string} event - Event type (completed, failed, etc.)
   * @param {Object} job - The Bull job object
   * @param {any} result - The result of the job (or error message)
   */
  handleBullJobEvent(event, job, result) {
    const namespace = wsConfig.namespaces.MAIN; // Use default namespace, or change as needed
    const ns = this.namespaces.get(namespace) || this.io;

    const message = {
      event,
      payload: {
        jobId: job.id,
        status: event,
        data: result,
      },
    };

    // Broadcast the message to all connected clients (can be specific rooms too)
    ns.emit(event, message);
    logger.info(`Bull job event: ${event} for job ${job.id}`);
  }

  /**
   * Register a handler for WebSocket events
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  registerHandler(event, handler) {
    this.handlers.set(event, handler);
  }
}

// Export as singleton
export default new WebSocketService();

