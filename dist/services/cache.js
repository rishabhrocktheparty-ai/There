"use strict";
// Cache Layer Implementation
// Redis configuration and cache service utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCache = exports.getCacheInstance = exports.CacheService = void 0;
const redis_1 = require("redis");
const logger_1 = require("./logger");
class CacheService {
    constructor(config) {
        this.defaultTTL = config.ttl || 3600; // 1 hour default
        this.client = (0, redis_1.createClient)({
            socket: {
                host: config.host,
                port: config.port,
            },
            password: config.password,
            database: config.db || 0,
        });
        this.client.on('error', (err) => {
            logger_1.logger.error('Redis Client Error', err);
        });
        this.client.on('connect', () => {
            logger_1.logger.info('Connected to Redis');
        });
    }
    async connect() {
        await this.client.connect();
    }
    async disconnect() {
        await this.client.disconnect();
    }
    // Basic cache operations
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value;
        }
        catch (error) {
            logger_1.logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const expiry = ttl || this.defaultTTL;
            await this.client.setEx(key, expiry, value);
        }
        catch (error) {
            logger_1.logger.error(`Cache set error for key ${key}:`, error);
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            logger_1.logger.error(`Cache delete error for key ${key}:`, error);
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }
    // Hash operations for complex data
    async hget(hash, field) {
        try {
            return await this.client.hGet(hash, field);
        }
        catch (error) {
            logger_1.logger.error(`Cache hget error for ${hash}:${field}:`, error);
            return null;
        }
    }
    async hset(hash, field, value) {
        try {
            await this.client.hSet(hash, field, value);
        }
        catch (error) {
            logger_1.logger.error(`Cache hset error for ${hash}:${field}:`, error);
        }
    }
    async hgetall(hash) {
        try {
            return await this.client.hGetAll(hash);
        }
        catch (error) {
            logger_1.logger.error(`Cache hgetall error for ${hash}:`, error);
            return null;
        }
    }
    // List operations for queues
    async lpush(key, ...values) {
        try {
            await this.client.lPush(key, values);
        }
        catch (error) {
            logger_1.logger.error(`Cache lpush error for key ${key}:`, error);
        }
    }
    async rpop(key) {
        try {
            return await this.client.rPop(key);
        }
        catch (error) {
            logger_1.logger.error(`Cache rpop error for key ${key}:`, error);
            return null;
        }
    }
    // Set operations
    async sadd(key, ...members) {
        try {
            await this.client.sAdd(key, members);
        }
        catch (error) {
            logger_1.logger.error(`Cache sadd error for key ${key}:`, error);
        }
    }
    async sismember(key, member) {
        try {
            const result = await this.client.sIsMember(key, member);
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error(`Cache sismember error for key ${key}:`, error);
            return false;
        }
    }
    // Cache warming utilities
    async warmCache(keys, fetcher) {
        const promises = keys.map(async (key) => {
            if (!(await this.exists(key))) {
                try {
                    const value = await fetcher(key);
                    await this.set(key, value);
                }
                catch (error) {
                    logger_1.logger.error(`Cache warming failed for key ${key}:`, error);
                }
            }
        });
        await Promise.all(promises);
    }
    // Cache invalidation patterns
    async invalidatePattern(pattern) {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                logger_1.logger.info(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
            }
        }
        catch (error) {
            logger_1.logger.error(`Cache invalidation error for pattern ${pattern}:`, error);
        }
    }
    // Health check
    async ping() {
        try {
            const result = await this.client.ping();
            return result === 'PONG';
        }
        catch (error) {
            logger_1.logger.error('Redis ping failed:', error);
            return false;
        }
    }
    // Get cache statistics
    async getStats() {
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
        }
        catch (error) {
            logger_1.logger.error('Failed to get cache stats:', error);
            return {
                connected: false,
                dbSize: 0,
                info: '',
            };
        }
    }
}
exports.CacheService = CacheService;
// Singleton cache instance
let cacheInstance = null;
const getCacheInstance = (config) => {
    if (!cacheInstance) {
        if (!config) {
            throw new Error('Cache config required for first initialization');
        }
        cacheInstance = new CacheService(config);
    }
    return cacheInstance;
};
exports.getCacheInstance = getCacheInstance;
const initializeCache = async (config) => {
    const cache = (0, exports.getCacheInstance)(config);
    await cache.connect();
    return cache;
};
exports.initializeCache = initializeCache;
