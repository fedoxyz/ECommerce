import { Server } from 'socket.io';
import wsConfig from '../../configs/websocket.js';  // Your config
import logger from '../../utils/logger.js';
import { User } from '../../api/models/index.js';

class WebSocketService {
  constructor() {
    this.io = null;
    this.namespaces = new Map();
  }

  /**
   * Initialize WebSocket server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, wsConfig.socketOptions);

    this.io.use(this.authenticateSocket.bind(this));

    // Set up main namespace
    const mainNamespace = this.io.of(wsConfig.namespaces.MAIN);
    this.setupNamespace(mainNamespace);
    this.namespaces.set(wsConfig.namespaces.MAIN, mainNamespace);

    // Set up additional namespaces if any
    Object.entries(wsConfig.namespaces).forEach(([key, namespace]) => {
      if (namespace === wsConfig.namespaces.MAIN) return;

      const ns = this.io.of(namespace);
      this.setupNamespace(ns);
      this.namespaces.set(namespace, ns);
    });

    logger.info('WebSocket service initialized');
  }

  /**
   * Set up event handlers for a namespace
   * @param {Object} namespace - Socket.IO namespace
   */
  setupNamespace(namespace) {
    namespace.on(wsConfig.events.CONNECTION, (socket) => {
      logger.info(`Client connected to ${namespace.name}`);

      // Handle authentication (example)
      this.handleAuthentication(socket);

      // Handle disconnection
      socket.on(wsConfig.events.DISCONNECT, () => {
        logger.warn(`Client disconnected from ${namespace.name}`);
      });

      // Handle errors
      socket.on(wsConfig.events.ERROR, (error) => {
        logger.error(`Socket error in ${namespace.name}:`, error);
      });
    });
  }

  /**
   * Authenticate WebSocket connection
   * @param {Object} socket - The Socket.IO socket object
   * @param {Function} next - The next middleware function
   */
  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;  // Token passed during the WebSocket handshake
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify the token and get the user data
      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid or expired token'));
      }

      // Fetch user details from the database
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      // Attach user data to the socket object
      socket.user = user;
      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      return next(new Error('Authentication failed'));
    }
  }

  /**
   * Emit a notification/event to a specific user
   * @param {string} userId - The user ID to target
   * @param {string} event - The event name (e.g., 'chat_message', 'notification')
   * @param {Object} data - Data to send (message, etc.)
   * @param {string} namespace - The namespace to use (optional)
   */
  sendToUser(userId, event, data, namespace = wsConfig.namespaces.MAIN) {
    const ns = this.namespaces.get(namespace) || this.io;

    // Emit to the user's room
    ns.to(`user:${userId}`).emit(event, data);
    logger.info(`Sent ${event} to user ${userId} in ${namespace}`);
  }

  /**
   * Broadcast a message to all connected clients (across namespaces or specific room)
   * @param {string} event - The event name (e.g., 'broadcast_message')
   * @param {Object} data - Data to send
   * @param {string} namespace - The namespace to use (optional)
   * @param {string} room - The room to send the message to (optional)
   */
  broadcast(event, data, namespace = wsConfig.namespaces.MAIN, room = '') {
    const ns = this.namespaces.get(namespace) || this.io;

    if (room) {
      // Broadcast to a specific room
      ns.to(room).emit(event, data);
    } else {
      // Broadcast to all clients in the namespace
      ns.emit(event, data);
    }

    logger.info(`Broadcasted ${event} to room ${room || 'all'} in ${namespace}`);
  }

  /**
   * Send a chat message to a specific room
   * @param {string} room - The room to send the message to
   * @param {string} event - The event name (e.g., 'chat_message')
   * @param {Object} message - The message data
   */
  sendChatMessage(room, event, message) {
    this.broadcast(event, message, wsConfig.namespaces.MAIN, room);
  }

  /**
   * Register a user to a room
   * @param {Object} socket - Socket.IO socket
   * @param {string} room - The room to join
   */
  joinRoom(socket, room) {
    socket.join(room);
    logger.info(`User ${socket.data.userId} joined room ${room}`);
  }

  /**
   * Leave a room
   * @param {Object} socket - Socket.IO socket
   * @param {string} room - The room to leave
   */
  leaveRoom(socket, room) {
    socket.leave(room);
    logger.info(`User ${socket.data.userId} left room ${room}`);
  }
}

export default new WebSocketService();

