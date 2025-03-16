import EventEmitter from 'events';

class EnhancedEventEmitter extends EventEmitter {
  constructor() {
    super();
  }

}

// Export a singleton instance
export default new EnhancedEventEmitter();
