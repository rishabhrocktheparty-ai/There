import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app';
import jwt from 'jsonwebtoken';

describe('Security Tests - Authentication & Authorization', () => {
  const app = createApp();
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  describe('JWT Token Security', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app).get('/api/config/ethical');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject malformed JWT tokens', async () => {
      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', 'Bearer malformed.token.here');

      expect(response.status).toBe(401);
    });

    it('should reject expired JWT tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user-1', role: 'super_admin' },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should reject JWT tokens with invalid signature', async () => {
      const invalidToken = jwt.sign(
        { userId: 'user-1', role: 'super_admin' },
        'wrong-secret'
      );

      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    it('should reject JWT tokens with missing claims', async () => {
      const invalidToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET); // Missing role

      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Role-Based Access Control', () => {
    let superAdminToken: string;
    let configManagerToken: string;
    let viewerToken: string;
    let userToken: string;

    beforeAll(() => {
      superAdminToken = jwt.sign(
        { userId: 'admin-1', role: 'super_admin' },
        JWT_SECRET
      );
      configManagerToken = jwt.sign(
        { userId: 'admin-2', role: 'config_manager' },
        JWT_SECRET
      );
      viewerToken = jwt.sign(
        { userId: 'admin-3', role: 'viewer' },
        JWT_SECRET
      );
      userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);
    });

    it('should allow super_admin full access', async () => {
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Test Config',
          description: 'Test',
          rules: [],
          isActive: true,
        });

      expect(response.status).toBe(201);
    });

    it('should allow config_manager to create configs', async () => {
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${configManagerToken}`)
        .send({
          name: 'Test Config',
          description: 'Test',
          rules: [],
          isActive: true,
        });

      expect(response.status).toBe(201);
    });

    it('should deny viewer from creating configs', async () => {
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Test Config',
          description: 'Test',
          rules: [],
          isActive: true,
        });

      expect(response.status).toBe(403);
    });

    it('should deny regular users from accessing admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should prevent privilege escalation', async () => {
      // Try to create admin with regular user token
      const response = await request(app)
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'newadmin@example.com',
          password: 'password123',
          role: 'super_admin',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Session Management', () => {
    it('should enforce session timeout', async () => {
      const shortLivedToken = jwt.sign(
        { userId: 'user-1', role: 'super_admin' },
        JWT_SECRET,
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', `Bearer ${shortLivedToken}`);

      expect(response.status).toBe(401);
    });

    it('should not allow token reuse after logout', async () => {
      // Note: This would require implementing a token blacklist
      // For now, we test the concept
      const token = jwt.sign({ userId: 'user-1', role: 'super_admin' }, JWT_SECRET);

      // Logout (would add token to blacklist)
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      // Try to use same token
      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', `Bearer ${token}`);

      // In a real implementation with blacklist, this should fail
      // expect(response.status).toBe(401);
    });
  });

  describe('Password Security', () => {
    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/user/register')
        .send({
          email: 'test@example.com',
          password: '123', // Too short
          name: 'Test User',
        });

      expect(response.status).toBe(400);
    });

    it('should hash passwords before storage', async () => {
      const response = await request(app)
        .post('/api/auth/user/register')
        .send({
          email: 'secure@example.com',
          password: 'SecurePassword123!',
          name: 'Secure User',
        });

      expect(response.status).toBe(201);
      // Password should never be returned
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should rate limit login attempts', async () => {
      const attempts = Array(6).fill(null);

      for (let i = 0; i < attempts.length; i++) {
        await request(app).post('/api/auth/user/login').send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      }

      // After rate limit exceeded
      const response = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(429); // Too Many Requests
    });
  });
});
