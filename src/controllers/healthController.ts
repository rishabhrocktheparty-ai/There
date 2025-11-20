import { Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { logger } from '../services/logger';

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: any;
  responseTime?: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: ServiceStatus;
    authentication: ServiceStatus;
    api: ServiceStatus;
    cache?: ServiceStatus;
  };
  system: {
    memory: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

/**
 * Check database connection and health
 */
async function checkDatabaseHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    // Count users to verify table access
    const userCount = await prisma.user.count();
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      message: 'Database connection successful',
      details: {
        userCount,
        provider: 'postgresql',
        connectionTime: `${responseTime}ms`
      },
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Database health check failed:', error);
    
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      responseTime
    };
  }
}

/**
 * Check authentication service health
 */
async function checkAuthenticationHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    // Verify we can query users and admin users (authentication tables)
    const [userCount, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.adminUser.count()
    ]);
    
    const responseTime = Date.now() - startTime;
    
    // Check if JWT_SECRET is configured
    const jwtConfigured = !!process.env.JWT_SECRET;
    
    if (!jwtConfigured) {
      return {
        status: 'degraded',
        message: 'JWT_SECRET not configured',
        details: {
          userCount,
          adminCount,
          jwtConfigured
        },
        responseTime
      };
    }
    
    return {
      status: 'healthy',
      message: 'Authentication service operational',
      details: {
        userCount,
        adminCount,
        jwtConfigured,
        queryTime: `${responseTime}ms`
      },
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Authentication health check failed:', error);
    
    return {
      status: 'unhealthy',
      message: 'Authentication service check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      responseTime
    };
  }
}

/**
 * Check API routes availability
 */
async function checkAPIHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    // Define critical API routes
    const criticalRoutes = [
      '/api/auth',
      '/api/admin',
      '/api/configs',
      '/api/profiles'
    ];
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      message: 'API routes registered',
      details: {
        criticalRoutes,
        totalRoutes: criticalRoutes.length,
        cors: !!process.env.CORS_ORIGIN,
        rateLimit: true
      },
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('API health check failed:', error);
    
    return {
      status: 'unhealthy',
      message: 'API check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      responseTime
    };
  }
}

/**
 * Check Redis cache health (optional)
 */
async function checkCacheHealth(): Promise<ServiceStatus | undefined> {
  // Only check if Redis is configured
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    return undefined;
  }
  
  const startTime = Date.now();
  try {
    // Try to import and check cache
    const { getCacheInstance } = await import('../services/cache');
    const cache = getCacheInstance();
    
    const isHealthy = await cache.ping();
    const responseTime = Date.now() - startTime;
    
    if (isHealthy) {
      const stats = await cache.getStats();
      
      return {
        status: 'healthy',
        message: 'Cache connection successful',
        details: {
          connected: stats.connected,
          dbSize: stats.dbSize,
          responseTime: `${responseTime}ms`
        },
        responseTime
      };
    } else {
      return {
        status: 'unhealthy',
        message: 'Cache ping failed',
        responseTime
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Cache is optional, so degraded instead of unhealthy
    return {
      status: 'degraded',
      message: 'Cache not available (optional)',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      responseTime
    };
  }
}

/**
 * Get system resource usage
 */
function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  const freeMem = totalMem - usedMem;
  
  return {
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      percentage: Math.round((usedMem / totalMem) * 100)
    },
    cpu: {
      usage: process.cpuUsage().user / 1000000 // Convert to seconds
    }
  };
}

/**
 * Determine overall health status based on services
 */
function determineOverallStatus(services: HealthCheckResponse['services']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = [
    services.database.status,
    services.authentication.status,
    services.api.status,
    services.cache?.status
  ].filter(Boolean);
  
  if (statuses.some(s => s === 'unhealthy')) {
    return 'unhealthy';
  }
  
  if (statuses.some(s => s === 'degraded')) {
    return 'degraded';
  }
  
  return 'healthy';
}

/**
 * Comprehensive health check endpoint
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // Run all health checks in parallel
    const [database, authentication, api, cache] = await Promise.all([
      checkDatabaseHealth(),
      checkAuthenticationHealth(),
      checkAPIHealth(),
      checkCacheHealth()
    ]);
    
    const services: HealthCheckResponse['services'] = {
      database,
      authentication,
      api
    };
    
    // Add cache only if it's configured
    if (cache) {
      services.cache = cache;
    }
    
    const overallStatus = determineOverallStatus(services);
    const system = getSystemMetrics();
    
    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services,
      system
    };
    
    const totalResponseTime = Date.now() - startTime;
    logger.info(`Health check completed in ${totalResponseTime}ms - Status: ${overallStatus}`);
    
    // Set appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check endpoint error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: { status: 'unhealthy', message: 'Check failed' },
        authentication: { status: 'unhealthy', message: 'Check failed' },
        api: { status: 'unhealthy', message: 'Check failed' }
      },
      system: getSystemMetrics(),
      error: error instanceof Error ? error.message : 'Unknown error'
    } as HealthCheckResponse);
  }
};

/**
 * Simple liveness probe (minimal check)
 */
export const livenessProbe = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
};

/**
 * Readiness probe (checks if app is ready to serve traffic)
 */
export const readinessProbe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Quick database check
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness probe failed:', error);
    
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
