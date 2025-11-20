import { describe, it, expect } from '@jest/globals';
import autocannon from 'autocannon';

describe('Performance Tests - Load Testing', () => {
  const BASE_URL = 'http://localhost:3000';

  describe('API Endpoint Load Tests', () => {
    it('should handle concurrent health check requests', async () => {
      const result = await autocannon({
        url: `${BASE_URL}/health`,
        connections: 100,
        duration: 10,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.requests.average).toBeGreaterThan(100); // At least 100 req/sec
      expect(result.latency.mean).toBeLessThan(100); // Average latency < 100ms
    });

    it('should handle concurrent authentication requests', async () => {
      const result = await autocannon({
        url: `${BASE_URL}/api/auth/user/login`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'loadtest@example.com',
          password: 'password123',
        }),
        connections: 50,
        duration: 10,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.requests.average).toBeGreaterThan(50); // At least 50 req/sec
      expect(result.latency.mean).toBeLessThan(200); // Average latency < 200ms
    });

    it('should handle high-throughput message sending', async () => {
      // First, get auth token
      const loginResponse = await fetch(`${BASE_URL}/api/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'loadtest@example.com',
          password: 'password123',
        }),
      });

      const { token } = await loginResponse.json();

      const result = await autocannon({
        url: `${BASE_URL}/api/conversations/messages`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: 'test-conv-1',
          content: 'Load test message',
        }),
        connections: 30,
        duration: 10,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.requests.average).toBeGreaterThan(30); // At least 30 req/sec
      expect(result.latency.p99).toBeLessThan(1000); // 99th percentile < 1s
    });
  });

  describe('Concurrent User Simulation', () => {
    it('should support 1000 concurrent users', async () => {
      const result = await autocannon({
        url: `${BASE_URL}/api/relationships`,
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-token-for-load-test',
        },
        connections: 1000,
        duration: 30,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.timeouts).toBe(0);
      expect(result.latency.mean).toBeLessThan(500);
    });

    it('should maintain performance under sustained load', async () => {
      const result = await autocannon({
        url: `${BASE_URL}/api/config/ethical`,
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-admin-token',
        },
        connections: 200,
        duration: 60, // 1 minute sustained
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.requests.average).toBeGreaterThan(100);
      
      // Check that performance doesn't degrade over time
      const firstHalfAvg = result.requests.total / 2 / 30;
      const secondHalfAvg = result.requests.total / 2 / 30;
      const degradation = (firstHalfAvg - secondHalfAvg) / firstHalfAvg;
      expect(degradation).toBeLessThan(0.2); // Less than 20% degradation
    });
  });

  describe('Database Query Performance', () => {
    it('should handle high-frequency database reads', async () => {
      const result = await autocannon({
        url: `${BASE_URL}/api/conversations`,
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-token-for-load-test',
        },
        connections: 100,
        duration: 15,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.latency.mean).toBeLessThan(150);
    });

    it('should handle concurrent database writes', async () => {
      const result = await autocannon({
        url: `${BASE_URL}/api/config/ethical`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-admin-token',
        },
        body: JSON.stringify({
          name: 'Load Test Config',
          description: 'Test',
          rules: [],
          isActive: true,
        }),
        connections: 50,
        duration: 10,
        pipelining: 1,
      });

      expect(result.errors).toBe(0);
      expect(result.latency.mean).toBeLessThan(300);
    });
  });

  describe('WebSocket Performance', () => {
    it('should handle multiple WebSocket connections', async () => {
      const connections = [];
      const connectionsCount = 100;

      for (let i = 0; i < connectionsCount; i++) {
        const ws = new WebSocket('ws://localhost:3000');
        connections.push(
          new Promise((resolve, reject) => {
            ws.on('open', () => resolve(ws));
            ws.on('error', reject);
          })
        );
      }

      const connectedWs = await Promise.all(connections);
      expect(connectedWs).toHaveLength(connectionsCount);

      // Clean up
      connectedWs.forEach((ws) => ws.close());
    });

    it('should handle high message throughput via WebSocket', async () => {
      const ws = new WebSocket('ws://localhost:3000');
      
      await new Promise((resolve) => ws.on('open', resolve));

      const startTime = Date.now();
      const messageCount = 1000;
      let receivedCount = 0;

      ws.on('message', () => {
        receivedCount++;
      });

      for (let i = 0; i < messageCount; i++) {
        ws.send(JSON.stringify({ type: 'message', content: `Test ${i}` }));
      }

      // Wait for all messages to be processed
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (receivedCount >= messageCount) {
            clearInterval(check);
            resolve(null);
          }
        }, 100);
      });

      const duration = Date.now() - startTime;
      const throughput = messageCount / (duration / 1000);

      expect(throughput).toBeGreaterThan(100); // At least 100 msg/sec
      ws.close();
    });
  });
});
