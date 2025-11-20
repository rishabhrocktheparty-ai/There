#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import * as net from 'net';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Test 1: Check environment variables
async function testEnvironmentVariables() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 1: Environment Variables', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    error('DATABASE_URL not found in environment variables');
    return false;
  }

  success('DATABASE_URL is set');
  
  try {
    const url = new URL(databaseUrl);
    info(`  Protocol: ${url.protocol}`);
    info(`  Host: ${url.hostname}`);
    info(`  Port: ${url.port}`);
    info(`  Database: ${url.pathname.slice(1)}`);
    info(`  Username: ${url.username}`);
    
    return true;
  } catch (err) {
    error('DATABASE_URL is malformed');
    return false;
  }
}

// Test 2: Check if PostgreSQL port is open
async function testPostgreSQLPort() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 2: PostgreSQL Port Connectivity', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      success('PostgreSQL port 5432 is open and accepting connections');
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      error('Connection to PostgreSQL port 5432 timed out');
      socket.destroy();
      resolve(false);
    });

    socket.on('error', (err: any) => {
      if (err.code === 'ECONNREFUSED') {
        error('PostgreSQL is not running on localhost:5432');
        info('  Start PostgreSQL with: docker-compose up -d postgres');
      } else {
        error(`Connection error: ${err.message}`);
      }
      resolve(false);
    });

    socket.connect(5432, 'localhost');
  });
}

// Test 3: Test Prisma connection
async function testPrismaConnection() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 3: Prisma Client Connection', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  try {
    await prisma.$connect();
    success('Prisma client connected successfully');
    return true;
  } catch (err: any) {
    error(`Prisma connection failed: ${err.message}`);
    return false;
  }
}

// Test 4: Execute a simple query
async function testDatabaseQuery() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 4: Database Query Execution', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  try {
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    success('Database query executed successfully');
    info(`  Current Time: ${(result as any)[0].current_time}`);
    info(`  PostgreSQL Version: ${(result as any)[0].pg_version.split(' ')[0]} ${(result as any)[0].pg_version.split(' ')[1]}`);
    return true;
  } catch (err: any) {
    error(`Query execution failed: ${err.message}`);
    return false;
  }
}

// Test 5: Check if tables exist
async function testTablesExist() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 5: Database Tables', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    if (tables.length === 0) {
      warning('No tables found in database');
      info('  Run migrations with: npm run prisma:migrate');
      return false;
    }

    success(`Found ${tables.length} tables in database:`);
    tables.forEach((table) => {
      info(`  - ${table.tablename}`);
    });

    // Check for required tables
    const requiredTables = ['User', 'AdminUser', 'EthicalConfig', 'RoleTemplate'];
    const tableNames = tables.map(t => t.tablename);
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));

    if (missingTables.length > 0) {
      warning(`Missing required tables: ${missingTables.join(', ')}`);
      return false;
    }

    success('All required tables exist');
    return true;
  } catch (err: any) {
    error(`Failed to check tables: ${err.message}`);
    return false;
  }
}

// Test 6: Check User table data
async function testUserTableData() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 6: User Table Data', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  try {
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({
      where: {
        adminProfile: {
          isNot: null,
        },
      },
    });
    const regularUserCount = userCount - adminCount;

    if (userCount === 0) {
      warning('No users found in database');
      info('  Seed the database with: npm run db:seed');
      return false;
    }

    success(`Found ${userCount} total users:`);
    info(`  - ${adminCount} admin users`);
    info(`  - ${regularUserCount} regular users`);

    // Get sample users
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: {
        email: true,
        displayName: true,
        authProvider: true,
        adminProfile: {
          select: {
            role: true,
          },
        },
      },
    });

    log('\n  Sample Users:', colors.cyan);
    sampleUsers.forEach((user) => {
      const role = user.adminProfile ? ` (${user.adminProfile.role})` : '';
      info(`    - ${user.email}${role} [${user.authProvider}]`);
    });

    return true;
  } catch (err: any) {
    error(`Failed to query User table: ${err.message}`);
    return false;
  }
}

// Test 7: Check migration status
async function testMigrationStatus() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 7: Migration Status', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  try {
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string; applied_at: Date }>>`
      SELECT migration_name, finished_at as applied_at
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC
    `;

    if (migrations.length === 0) {
      warning('No migrations have been applied');
      info('  Run migrations with: npm run prisma:migrate');
      return false;
    }

    success(`Found ${migrations.length} applied migration(s):`);
    migrations.forEach((migration) => {
      const date = new Date(migration.applied_at).toISOString().split('T')[0];
      info(`  - ${migration.migration_name} (${date})`);
    });

    return true;
  } catch (err: any) {
    warning('Could not check migration status');
    info(`  ${err.message}`);
    return false;
  }
}

// Test 8: Test write operations
async function testWriteOperations() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('TEST 8: Database Write Operations', colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);

  try {
    // Create a test user
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        authProvider: 'PASSWORD',
        displayName: 'Test User',
        passwordHash: 'test-hash',
      },
    });

    success('Successfully created test user');
    info(`  ID: ${testUser.id}`);
    info(`  Email: ${testUser.email}`);

    // Read the test user
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    if (foundUser) {
      success('Successfully read test user');
    } else {
      error('Failed to read test user');
      return false;
    }

    // Update the test user
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { displayName: 'Updated Test User' },
    });

    if (updatedUser.displayName === 'Updated Test User') {
      success('Successfully updated test user');
    } else {
      error('Failed to update test user');
      return false;
    }

    // Delete the test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    success('Successfully deleted test user');

    return true;
  } catch (err: any) {
    error(`Write operation failed: ${err.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n╔════════════════════════════════════════╗', colors.blue);
  log('║   Database Connection Test Suite      ║', colors.blue);
  log('╚════════════════════════════════════════╝', colors.blue);

  const results = {
    envVars: false,
    portOpen: false,
    prismaConnect: false,
    queryExec: false,
    tablesExist: false,
    userData: false,
    migrations: false,
    writeOps: false,
  };

  try {
    results.envVars = await testEnvironmentVariables();
    results.portOpen = await testPostgreSQLPort();
    
    if (results.portOpen) {
      results.prismaConnect = await testPrismaConnection();
      
      if (results.prismaConnect) {
        results.queryExec = await testDatabaseQuery();
        results.tablesExist = await testTablesExist();
        results.migrations = await testMigrationStatus();
        results.userData = await testUserTableData();
        results.writeOps = await testWriteOperations();
      }
    }
  } catch (err: any) {
    error(`Unexpected error: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }

  // Summary
  log('\n╔════════════════════════════════════════╗', colors.blue);
  log('║          Test Results Summary          ║', colors.blue);
  log('╚════════════════════════════════════════╝', colors.blue);

  const tests = [
    { name: 'Environment Variables', result: results.envVars },
    { name: 'PostgreSQL Port', result: results.portOpen },
    { name: 'Prisma Connection', result: results.prismaConnect },
    { name: 'Query Execution', result: results.queryExec },
    { name: 'Tables Exist', result: results.tablesExist },
    { name: 'Migration Status', result: results.migrations },
    { name: 'User Data', result: results.userData },
    { name: 'Write Operations', result: results.writeOps },
  ];

  const passedTests = tests.filter(t => t.result).length;
  const totalTests = tests.length;

  tests.forEach(test => {
    const status = test.result ? '✅ PASS' : '❌ FAIL';
    const color = test.result ? colors.green : colors.red;
    log(`${status} - ${test.name}`, color);
  });

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  
  if (passedTests === totalTests) {
    success(`All tests passed! (${passedTests}/${totalTests})`);
    log('\n🎉 Database is fully operational!\n', colors.green);
    process.exit(0);
  } else {
    warning(`${passedTests}/${totalTests} tests passed`);
    log('\n⚠️  Some tests failed. Please review the output above.\n', colors.yellow);
    process.exit(1);
  }
}

// Run the tests
runTests().catch((err) => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});
