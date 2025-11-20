import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate, requireRole } from '../../src/middleware/authMiddleware';
import { AdminRole } from '../../src/types/auth';

describe('Auth Middleware', () => {
  const JWT_SECRET = 'test-secret';
  process.env.JWT_SECRET = JWT_SECRET;

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const payload = { userId: '123', role: 'super_admin' };
      const token = jwt.sign(payload, JWT_SECRET);

      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      authenticate(mockReq as any, mockRes as any, mockNext);

      expect(mockReq).toHaveProperty('user');
      expect((mockReq as any).user.userId).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject missing token', () => {
      const mockReq = {
        headers: {},
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      authenticate(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'No token provided',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      const mockReq = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      authenticate(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid token',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject expired token', () => {
      const payload = { userId: '123', role: 'super_admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });

      const mockReq = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      authenticate(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access for super_admin', () => {
      const mockReq = {
        user: {
          userId: '123',
          role: 'super_admin' as AdminRole,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = requireRole(['super_admin', 'config_manager']);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for config_manager', () => {
      const mockReq = {
        user: {
          userId: '123',
          role: 'config_manager' as AdminRole,
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      const middleware = requireRole(['super_admin', 'config_manager']);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for viewer', () => {
      const mockReq = {
        user: {
          userId: '123',
          role: 'viewer' as AdminRole,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      const middleware = requireRole(['super_admin', 'config_manager']);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Insufficient permissions',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user not authenticated', () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      const middleware = requireRole(['super_admin']);
      middleware(mockReq as any, mockRes as any, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
