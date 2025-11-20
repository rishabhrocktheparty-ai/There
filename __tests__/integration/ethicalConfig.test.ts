import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app';
import jwt from 'jsonwebtoken';

describe('Ethical Config Routes Integration', () => {
  const app = createApp();
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  let adminToken: string;
  let viewerToken: string;

  beforeAll(() => {
    // Create admin token
    adminToken = jwt.sign(
      { userId: 'admin-1', role: 'super_admin' },
      JWT_SECRET
    );

    // Create viewer token
    viewerToken = jwt.sign(
      { userId: 'viewer-1', role: 'viewer' },
      JWT_SECRET
    );
  });

  describe('POST /api/config/ethical', () => {
    it('should create config with admin role', async () => {
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Config',
          description: 'Test description',
          rules: ['No harmful content', 'Be respectful'],
          isActive: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Config');
    });

    it('should reject creation without token', async () => {
      const response = await request(app)
        .post('/api/config/ethical')
        .send({
          name: 'Test Config',
          description: 'Test description',
          rules: [],
          isActive: true,
        });

      expect(response.status).toBe(401);
    });

    it('should reject creation with viewer role', async () => {
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Test Config',
          description: 'Test description',
          rules: [],
          isActive: true,
        });

      expect(response.status).toBe(403);
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '', // Invalid: empty name
          description: 'Test description',
          rules: [],
          isActive: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/config/ethical', () => {
    it('should retrieve all configs with admin role', async () => {
      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should retrieve all configs with viewer role', async () => {
      const response = await request(app)
        .get('/api/config/ethical')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject retrieval without token', async () => {
      const response = await request(app).get('/api/config/ethical');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/config/ethical/:id', () => {
    let configId: string;

    beforeAll(async () => {
      // Create a config to update
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Update',
          description: 'Will be updated',
          rules: ['rule1'],
          isActive: true,
        });

      configId = response.body.id;
    });

    it('should update config with admin role', async () => {
      const response = await request(app)
        .put(`/api/config/ethical/${configId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Config',
          isActive: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Config');
      expect(response.body.isActive).toBe(false);
    });

    it('should reject update with viewer role', async () => {
      const response = await request(app)
        .put(`/api/config/ethical/${configId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Updated Config',
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent config', async () => {
      const response = await request(app)
        .put('/api/config/ethical/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Config',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/config/ethical/:id', () => {
    let configId: string;

    beforeAll(async () => {
      // Create a config to delete
      const response = await request(app)
        .post('/api/config/ethical')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'To Delete',
          description: 'Will be deleted',
          rules: [],
          isActive: true,
        });

      configId = response.body.id;
    });

    it('should delete config with admin role', async () => {
      const response = await request(app)
        .delete(`/api/config/ethical/${configId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should reject deletion with viewer role', async () => {
      const response = await request(app)
        .delete(`/api/config/ethical/${configId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent config', async () => {
      const response = await request(app)
        .delete('/api/config/ethical/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
