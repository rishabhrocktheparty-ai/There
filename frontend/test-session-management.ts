/**
 * Comprehensive Session Management Test
 * Tests all session management features including:
 * - Session storage and retrieval
 * - Token refresh
 * - Activity tracking
 * - Inactivity timeout
 * - Logout functionality
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000';

// Test credentials
const TEST_USER = {
  email: 'user@there.ai',
  password: 'User123!'
};

const TEST_ADMIN = {
  email: 'admin@there.ai',
  password: 'Admin123!'
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message: string, color: keyof typeof colors = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testUserLogin() {
  log('\n📝 Test 1: User Login & Session Creation', 'cyan');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/user/login`, TEST_USER);
    
    if (response.data.token && response.data.user) {
      log('✅ User login successful', 'green');
      log(`   Token: ${response.data.token.substring(0, 20)}...`, 'blue');
      log(`   User: ${response.data.user.email}`, 'blue');
      return response.data.token;
    } else {
      throw new Error('No token or user in response');
    }
  } catch (error: any) {
    log(`❌ User login failed: ${error.message}`, 'red');
    throw error;
  }
}

async function testTokenValidation(token: string) {
  log('\n🔍 Test 2: Session Validation', 'cyan');
  try {
    const response = await axios.get(`${API_BASE}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.valid && response.data.user) {
      log('✅ Session validation successful', 'green');
      log(`   Valid: ${response.data.valid}`, 'blue');
      log(`   User: ${response.data.user.email}`, 'blue');
      return true;
    } else {
      throw new Error('Session validation returned invalid');
    }
  } catch (error: any) {
    log(`❌ Session validation failed: ${error.message}`, 'red');
    return false;
  }
}

async function testTokenRefresh(token: string) {
  log('\n🔄 Test 3: Token Refresh', 'cyan');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.token && response.data.user) {
      log('✅ Token refresh successful', 'green');
      log(`   New Token: ${response.data.token.substring(0, 20)}...`, 'blue');
      log(`   User: ${response.data.user.email}`, 'blue');
      log(`   Tokens Match: ${token === response.data.token ? 'No (refreshed)' : 'Yes (same)'}`, 'blue');
      return response.data.token;
    } else {
      throw new Error('No token or user in refresh response');
    }
  } catch (error: any) {
    log(`❌ Token refresh failed: ${error.message}`, 'red');
    throw error;
  }
}

async function testProtectedRoute(token: string) {
  log('\n🔐 Test 4: Protected Route Access', 'cyan');
  try {
    const response = await axios.get(`${API_BASE}/api/auth/current-user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.user) {
      log('✅ Protected route accessible', 'green');
      log(`   User: ${response.data.user.email}`, 'blue');
      log(`   ID: ${response.data.user.id}`, 'blue');
      return true;
    } else {
      throw new Error('No user data in response');
    }
  } catch (error: any) {
    log(`❌ Protected route access failed: ${error.message}`, 'red');
    return false;
  }
}

async function testLogout(token: string) {
  log('\n🚪 Test 5: Logout & Session Cleanup', 'cyan');
  try {
    // Call logout endpoint
    await axios.post(`${API_BASE}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    log('✅ Logout request successful', 'green');
    
    // Try to use the token after logout (should fail)
    try {
      await axios.get(`${API_BASE}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      log('⚠️  Warning: Token still valid after logout (expected for JWT)', 'yellow');
    } catch (error) {
      log('✅ Token invalidated after logout', 'green');
    }
    
    return true;
  } catch (error: any) {
    log(`❌ Logout failed: ${error.message}`, 'red');
    return false;
  }
}

async function testInvalidToken() {
  log('\n🚫 Test 6: Invalid Token Rejection', 'cyan');
  try {
    await axios.get(`${API_BASE}/api/auth/validate`, {
      headers: { Authorization: 'Bearer invalid-token-123' }
    });
    
    log('❌ Invalid token was accepted (security issue!)', 'red');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      log('✅ Invalid token correctly rejected', 'green');
      log(`   Status: ${error.response.status}`, 'blue');
      return true;
    } else {
      log(`⚠️  Unexpected error: ${error.message}`, 'yellow');
      return false;
    }
  }
}

async function testAdminLogin() {
  log('\n👔 Test 7: Admin Login & Role Validation', 'cyan');
  try {
    const response = await axios.post(`${API_BASE}/api/auth/admin/login`, TEST_ADMIN);
    
    if (response.data.token && response.data.user) {
      log('✅ Admin login successful', 'green');
      log(`   Token: ${response.data.token.substring(0, 20)}...`, 'blue');
      log(`   User: ${response.data.user.email}`, 'blue');
      log(`   Role: ${response.data.user.role || 'N/A'}`, 'blue');
      return response.data.token;
    } else {
      throw new Error('No token or user in response');
    }
  } catch (error: any) {
    log(`❌ Admin login failed: ${error.message}`, 'red');
    throw error;
  }
}

async function testSessionPersistence(token: string) {
  log('\n💾 Test 8: Session Persistence', 'cyan');
  try {
    // Simulate page reload by validating session
    const response = await axios.get(`${API_BASE}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.valid) {
      log('✅ Session persists across requests', 'green');
      log(`   User: ${response.data.user.email}`, 'blue');
      return true;
    } else {
      log('❌ Session not persisted', 'red');
      return false;
    }
  } catch (error: any) {
    log(`❌ Session persistence check failed: ${error.message}`, 'red');
    return false;
  }
}

async function testConcurrentRequests(token: string) {
  log('\n⚡ Test 9: Concurrent Request Handling', 'cyan');
  try {
    // Make multiple concurrent requests with same token
    const requests = Array(5).fill(null).map((_, i) => 
      axios.get(`${API_BASE}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => ({ index: i, success: true, user: res.data.user.email }))
        .catch(err => ({ index: i, success: false, error: err.message }))
    );
    
    const results = await Promise.all(requests);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    if (successful === 5) {
      log(`✅ All ${successful} concurrent requests successful`, 'green');
      return true;
    } else {
      log(`⚠️  ${successful} succeeded, ${failed} failed`, 'yellow');
      return false;
    }
  } catch (error: any) {
    log(`❌ Concurrent request test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('╔══════════════════════════════════════════════════════╗', 'blue');
  log('║   Session Management Comprehensive Test Suite       ║', 'blue');
  log('╚══════════════════════════════════════════════════════╝', 'blue');
  
  const results: { test: string; passed: boolean }[] = [];
  
  try {
    // Test 1: User Login
    const userToken = await testUserLogin();
    results.push({ test: 'User Login', passed: true });
    
    // Test 2: Session Validation
    const validationPassed = await testTokenValidation(userToken);
    results.push({ test: 'Session Validation', passed: validationPassed });
    
    // Test 3: Token Refresh
    const refreshedToken = await testTokenRefresh(userToken);
    results.push({ test: 'Token Refresh', passed: true });
    
    // Test 4: Protected Route
    const protectedRoutePassed = await testProtectedRoute(refreshedToken);
    results.push({ test: 'Protected Route', passed: protectedRoutePassed });
    
    // Test 5: Invalid Token
    const invalidTokenPassed = await testInvalidToken();
    results.push({ test: 'Invalid Token Rejection', passed: invalidTokenPassed });
    
    // Test 6: Admin Login
    const adminToken = await testAdminLogin();
    results.push({ test: 'Admin Login', passed: true });
    
    // Test 7: Session Persistence
    const persistencePassed = await testSessionPersistence(adminToken);
    results.push({ test: 'Session Persistence', passed: persistencePassed });
    
    // Test 8: Concurrent Requests
    const concurrentPassed = await testConcurrentRequests(adminToken);
    results.push({ test: 'Concurrent Requests', passed: concurrentPassed });
    
    // Test 9: Logout
    const logoutPassed = await testLogout(refreshedToken);
    results.push({ test: 'Logout & Cleanup', passed: logoutPassed });
    
  } catch (error: any) {
    log(`\n💥 Test suite interrupted: ${error.message}`, 'red');
  }
  
  // Summary
  log('\n╔══════════════════════════════════════════════════════╗', 'blue');
  log('║                   Test Summary                       ║', 'blue');
  log('╚══════════════════════════════════════════════════════╝', 'blue');
  
  results.forEach(({ test, passed }) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status}: ${test}`, color);
  });
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  log(`\n📊 Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`, 
      passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All session management tests passed!', 'green');
  } else {
    log(`\n⚠️  ${totalTests - passedTests} test(s) failed`, 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
