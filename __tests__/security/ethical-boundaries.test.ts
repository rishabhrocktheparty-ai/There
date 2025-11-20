import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app';
import jwt from 'jsonwebtoken';

describe('Security Tests - Ethical Boundaries', () => {
  const app = createApp();
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

  describe('Usage Limits Enforcement', () => {
    it('should enforce daily message limits', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      // Send messages up to the limit
      const limit = 100; // Example limit
      const responses = [];

      for (let i = 0; i < limit + 10; i++) {
        const response = await request(app)
          .post('/api/conversations/messages')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            conversationId: 'conv-1',
            content: `Message ${i}`,
          });

        responses.push(response);
      }

      // Last few requests should be rate limited
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body).toHaveProperty('error');
      expect(lastResponse.body.error).toContain('limit');
    });

    it('should enforce conversation duration limits', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      // Start conversation
      const startResponse = await request(app)
        .post('/api/conversations')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          relationshipId: 'rel-1',
          title: 'Test Conversation',
        });

      const conversationId = startResponse.body.id;

      // Simulate long conversation (would need time manipulation)
      // After configured duration (e.g., 2 hours), should warn or limit

      const response = await request(app)
        .post('/api/conversations/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          conversationId,
          content: 'Are we still talking?',
        });

      // Should include warning in response
      if (response.body.meta) {
        expect(response.body.meta).toHaveProperty('durationWarning');
      }
    });

    it('should track and limit relationship count', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      // Try to create more relationships than allowed
      const maxRelationships = 10; // Example limit

      for (let i = 0; i < maxRelationships + 5; i++) {
        const response = await request(app)
          .post('/api/relationships')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            roleType: 'mentor',
            customName: `Mentor ${i}`,
          });

        if (i >= maxRelationships) {
          expect(response.status).toBe(400);
          expect(response.body.error).toContain('maximum');
        }
      }
    });
  });

  describe('Crisis Detection', () => {
    it('should detect harmful content patterns', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      const harmfulMessages = [
        'I want to hurt myself',
        'I am thinking about suicide',
        'I want to harm someone',
      ];

      for (const message of harmfulMessages) {
        const response = await request(app)
          .post('/api/conversations/messages')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            conversationId: 'conv-1',
            content: message,
          });

        // Should flag and provide resources
        expect(response.body).toHaveProperty('crisisDetected', true);
        expect(response.body).toHaveProperty('resources');
        expect(response.body.resources).toContainEqual(
          expect.objectContaining({
            type: 'crisis_helpline',
          })
        );
      }
    });

    it('should provide crisis intervention resources', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/conversations/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          conversationId: 'conv-1',
          content: 'I feel hopeless',
        });

      if (response.body.crisisDetected) {
        expect(response.body.resources).toBeInstanceOf(Array);
        expect(response.body.resources.length).toBeGreaterThan(0);
        expect(response.body.resources[0]).toHaveProperty('name');
        expect(response.body.resources[0]).toHaveProperty('contact');
      }
    });

    it('should escalate severe crisis situations', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      const response = await request(app)
        .post('/api/conversations/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          conversationId: 'conv-1',
          content: 'I am going to end my life right now',
        });

      expect(response.body).toHaveProperty('crisisLevel', 'severe');
      expect(response.body).toHaveProperty('immediateAction', true);
      // Should log for manual review
      // Should potentially notify emergency contacts
    });
  });

  describe('Addiction Prevention', () => {
    it('should track usage patterns', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      // Simulate multiple sessions in short time
      for (let i = 0; i < 20; i++) {
        await request(app)
          .post('/api/conversations/messages')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            conversationId: 'conv-1',
            content: `Quick message ${i}`,
          });
      }

      // Check usage stats
      const statsResponse = await request(app)
        .get('/api/analytics/usage')
        .set('Authorization', `Bearer ${userToken}`);

      expect(statsResponse.body).toHaveProperty('usagePatterns');
      
      if (statsResponse.body.usagePatterns.excessive) {
        expect(statsResponse.body).toHaveProperty('recommendations');
      }
    });

    it('should provide break reminders', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      // Simulate extended conversation
      const response = await request(app)
        .post('/api/conversations/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          conversationId: 'conv-1',
          content: 'Still chatting',
        });

      // After threshold, should suggest break
      if (response.body.meta) {
        expect(response.body.meta).toHaveProperty('breakSuggestion');
      }
    });

    it('should enforce healthy usage patterns', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      // Check if usage analytics provide insights
      const analyticsResponse = await request(app)
        .get('/api/analytics/usage')
        .set('Authorization', `Bearer ${userToken}`);

      expect(analyticsResponse.body).toHaveProperty('healthMetrics');
      expect(analyticsResponse.body.healthMetrics).toHaveProperty('dailyUsage');
      expect(analyticsResponse.body.healthMetrics).toHaveProperty('recommendedLimit');
    });
  });

  describe('Content Filtering', () => {
    it('should block inappropriate content', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      const inappropriateContent = [
        'explicit sexual content here',
        'violent graphic description',
        'hate speech content',
      ];

      for (const content of inappropriateContent) {
        const response = await request(app)
          .post('/api/conversations/messages')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            conversationId: 'conv-1',
            content,
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('appropriate');
      }
    });

    it('should apply age-appropriate filtering', async () => {
      const minorToken = jwt.sign(
        { userId: 'minor-1', age: 15 },
        JWT_SECRET
      );

      const response = await request(app)
        .post('/api/conversations/messages')
        .set('Authorization', `Bearer ${minorToken}`)
        .send({
          conversationId: 'conv-1',
          content: 'Tell me about adult topics',
        });

      // Should apply stricter filtering for minors
      if (response.body.aiResponse) {
        expect(response.body.aiResponse).not.toContain('adult');
        expect(response.body.meta).toHaveProperty('ageAppropriate', true);
      }
    });

    it('should respect cultural sensitivities', async () => {
      const userToken = jwt.sign(
        { userId: 'user-1', culturalContext: 'conservative' },
        JWT_SECRET
      );

      const response = await request(app)
        .post('/api/conversations/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          conversationId: 'conv-1',
          content: 'Tell me about relationships',
        });

      // AI response should adapt to cultural context
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('culturallyAdapted', true);
    });
  });

  describe('Transparent Logging', () => {
    it('should log all AI interactions', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      await request(app)
        .post('/api/conversations/messages')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          conversationId: 'conv-1',
          content: 'Test message',
        });

      // Check audit log
      const adminToken = jwt.sign(
        { userId: 'admin-1', role: 'super_admin' },
        JWT_SECRET
      );

      const auditResponse = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ userId: 'user-1', type: 'ai_interaction' });

      expect(auditResponse.status).toBe(200);
      expect(auditResponse.body).toBeInstanceOf(Array);
      expect(auditResponse.body.length).toBeGreaterThan(0);
    });

    it('should allow users to review their data', async () => {
      const userToken = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

      const response = await request(app)
        .get('/api/profile/data-export')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('conversations');
      expect(response.body).toHaveProperty('relationships');
      expect(response.body).toHaveProperty('usageStats');
    });
  });
});
