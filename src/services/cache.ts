// Cache Layer Implementation
// Redis configuration and cache service utilities

import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  ttl?: number;
}

export class CacheService {
  private client: RedisClientType;
  private defaultTTL: number;

  constructor(config: CacheConfig) {
    this.defaultTTL = config.ttl || 3600; // 1 hour default

    this.client = createClient({
      socket: {
        host: config.host,
        port: config.port,
      },
      password: config.password,
      database: config.db || 0,
    });

    this.client.on('error', (err: Error) => {
      logger.error('Redis Client Error', err);
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  // Basic cache operations
  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const expiry = ttl || this.defaultTTL;
      await this.client.setEx(key, expiry, value);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // Hash operations for complex data
  async hget(hash: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(hash, field);
    } catch (error) {
      logger.error(`Cache hget error for ${hash}:${field}:`, error);
      return null;
    }
  }

  async hset(hash: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hSet(hash, field, value);
    } catch (error) {
      logger.error(`Cache hset error for ${hash}:${field}:`, error);
    }
  }

  async hgetall(hash: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hGetAll(hash);
    } catch (error) {
      logger.error(`Cache hgetall error for ${hash}:`, error);
      return null;
    }
  }

  // List operations for queues
  async lpush(key: string, ...values: string[]): Promise<void> {
    try {
      await this.client.lPush(key, values);
    } catch (error) {
      logger.error(`Cache lpush error for key ${key}:`, error);
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error(`Cache rpop error for key ${key}:`, error);
      return null;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sAdd(key, members);
    } catch (error) {
      logger.error(`Cache sadd error for key ${key}:`, error);
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sIsMember(key, member);
      return result === 1;
    } catch (error) {
      logger.error(`Cache sismember error for key ${key}:`, error);
      return false;
    }
  }

  // Cache warming utilities
  async warmCache(keys: string[], fetcher: (key: string) => Promise<string>): Promise<void> {
    const promises = keys.map(async (key) => {
      if (!(await this.exists(key))) {
        try {
          const value = await fetcher(key);
          await this.set(key, value);
        } catch (error) {
          logger.error(`Cache warming failed for key ${key}:`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Cache invalidation error for pattern ${pattern}:`, error);
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis ping failed:', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats(): Promise<{
    connected: boolean;
    dbSize: number;
    info: string;
  }> {
    try {
      const [dbSize, info] = await Promise.all([
        this.client.dbSize(),
        this.client.info(),
      ]);

      return {
        connected: true,
        dbSize,
        info,
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return {
        connected: false,
        dbSize: 0,
        info: '',
      };
    }
  }
}

// Singleton cache instance
let cacheInstance: CacheService | null = null;

export const getCacheInstance = (config?: CacheConfig): CacheService => {
  if (!cacheInstance) {
    if (!config) {
      throw new Error('Cache config required for first initialization');
    }
    cacheInstance = new CacheService(config);
  }
  return cacheInstance;
};

export const initializeCache = async (config: CacheConfig): Promise<CacheService> => {
  const cache = getCacheInstance(config);
  await cache.connect();
  return cache;
};