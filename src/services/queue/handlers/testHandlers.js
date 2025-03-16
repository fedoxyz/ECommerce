import { TEST } from '../jobTypes.js';

const testHandler1 = async (data) => {
  console.log('testHandler1:', data);
};

const testHandler2 = async (data) => {
  console.log('testHandler2:', data);
};

// Export all cart-related handlers
export default {
  [TEST.TEST_1]: testHandler1,
  [TEST.TEST_2]: testHandler2,
};
