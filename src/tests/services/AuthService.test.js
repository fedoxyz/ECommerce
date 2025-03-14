import AuthService from '../../src/api/services/AuthService.js';
import UserRepository from '../../src/api/repositories/UserRepository.js';
import { generateToken } from '../../src/utils/jwt.js';

jest.mock('../../src/api/repositories/UserRepository.js');
jest.mock('../../src/utils/jwt.js');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const createdUser = { ...userData, id: '1', role: 'user' };
      UserRepository.create.mockResolvedValue(createdUser);
      generateToken.mockReturnValue('fake_token');

      const result = await AuthService.register(userData);

      expect(UserRepository.create).toHaveBeenCalledWith(userData);
      expect(generateToken).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual({
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'user'
        },
        token: 'fake_token'
      });
    });

    it('should throw an error if email is already in use', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      UserRepository.findByEmail.mockResolvedValue({ id: '2' });

      await expect(AuthService.register(userData)).rejects.toThrow('Email already in use');
    });
  });
});
