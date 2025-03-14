import { authenticate } from '../../src/api/middleware/auth.js';
import { verifyToken } from '../../src/utils/jwt.js';
import UserRepository from '../../src/api/repositories/UserRepository.js';

jest.mock('../../src/utils/jwt.js');
jest.mock('../../src/api/repositories/UserRepository.js');

describe('authenticate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should authenticate a valid token', async () => {
    const token = 'valid_token';
    const decodedToken = { id: '1' };
    const user = { id: '1', email: 'user@example.com', isActive: true };

    req.headers.authorization = `Bearer ${token}`;
    verifyToken.mockReturnValue(decodedToken);
    UserRepository.findByPk.mockResolvedValue(user);

    await authenticate(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(UserRepository.findByPk).toHaveBeenCalledWith('1');
    expect(req.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', async () => {
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
    });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalid_token';
    verifyToken.mockReturnValue(null);

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found or inactive', async () => {
    req.headers.authorization = 'Bearer valid_token';
    verifyToken.mockReturnValue({ id: '1' });
    UserRepository.findByPk.mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found or inactive' });
    expect(next).not.toHaveBeenCalled();
  });
});
