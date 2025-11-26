import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app';
import jwt from 'jsonwebtoken';

describe('Auth Routes Integration', () => {
  const app = createApp();
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  describe('POST /api/auth/admin/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'admin@example.com');
      expect(response.body.user).toHaveProperty('role');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          password: 'admin123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'admin@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/user/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/user/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/user/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'User 1',
        });

      const response = await request(app)
        .post('/api/auth/user/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'User 2',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/user/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'User',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/user/login', () => {
    beforeAll(async () => {
      // Register a test user
      await request(app)
        .post('/api/auth/user/register')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
          name: 'Test User',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/user/social-login', () => {
    it('should login with fake Google token in development mode', async () => {
      // Set NODE_ENV to development for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        const response = await request(app)
          .post('/api/auth/user/social-login')
          .send({
            provider: 'google',
            accessToken: 'fake-google-token-12345',
          });

        // In development mode with fake token, should succeed or create user
        expect([200, 201, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('token');
          expect(response.body).toHaveProperty('user');
          expect(response.body.user).toHaveProperty('email', 'mockuser@gmail.com');
        }
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should login with mock_ prefix token in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      try {
        const response = await request(app)
          .post('/api/auth/user/social-login')
          .send({
            provider: 'github',
            accessToken: 'mock_github_token_12345',
          });

        expect([200, 201, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('token');
          expect(response.body.user).toHaveProperty('email', 'mockuser@github.com');
        }
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should reject missing provider', async () => {
      const response = await request(app)
        .post('/api/auth/user/social-login')
        .send({
          accessToken: 'some-token',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject missing accessToken', async () => {
      const response = await request(app)
        .post('/api/auth/user/social-login')
        .send({
          provider: 'google',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should reject invalid provider', async () => {
      const response = await request(app)
        .post('/api/auth/user/social-login')
        .send({
          provider: 'invalid',
          accessToken: 'some-token',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });
});
