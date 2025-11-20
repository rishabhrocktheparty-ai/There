import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { validateBody } from '../../src/utils/validator';

describe('Validator Utility', () => {
  describe('validateBody', () => {
    const testSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      age: z.number().min(18),
    });

    it('should validate correct data', () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          age: 25,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = validateBody(testSchema);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid email', () => {
      const mockReq = {
        body: {
          email: 'invalid-email',
          password: 'password123',
          age: 25,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      const middleware = validateBody(testSchema);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation failed',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject password shorter than 8 characters', () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'short',
          age: 25,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      const middleware = validateBody(testSchema);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject age under 18', () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          age: 15,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      const middleware = validateBody(testSchema);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject missing required fields', () => {
      const mockReq = {
        body: {
          email: 'test@example.com',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      const middleware = validateBody(testSchema);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
