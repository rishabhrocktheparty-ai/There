import { test, expect } from '@playwright/test';

test.describe('User Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to user login
    await page.goto('http://localhost:8080/login');
  });

  test('should register new user', async ({ page }) => {
    await page.click('text=Sign Up');
    
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');

    // Verify redirect to role selection
    await page.waitForURL('**/app/role-selection');
    await expect(page.locator('h1')).toContainText('Select Your Roles');
  });

  test('should login as user successfully', async ({ page }) => {
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to relationships dashboard
    await page.waitForURL('**/app/relationships');
    
    // Verify relationships page is loaded
    await expect(page.locator('h1')).toContainText('Relationships');
  });

  test('should select and configure relationship role', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');

    // Navigate to role selection
    await page.click('button:has-text("Add Relationship")');
    await page.waitForURL('**/app/role-selection');

    // Select father role
    await page.click('.role-card:has-text("Father")');
    
    // Customize
    await page.fill('input[name="customName"]', 'Dad');
    await page.click('input[name="enableVoice"]');
    
    // Save
    await page.click('button:has-text("Create Relationship")');

    // Verify created
    await expect(page.locator('.success-message')).toContainText('Relationship created');
    await page.waitForURL('**/app/relationships');
  });

  test('should start conversation with relationship', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');

    // Click on first relationship
    await page.click('.relationship-card:first-child');

    // Verify conversation page
    await page.waitForURL('**/app/conversation/**');
    await expect(page.locator('.conversation-container')).toBeVisible();
  });

  test('should send and receive messages', async ({ page }) => {
    // Login and navigate to conversation
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');
    await page.click('.relationship-card:first-child');
    await page.waitForURL('**/app/conversation/**');

    // Send message
    await page.fill('textarea[name="message"]', 'Hello, how are you?');
    await page.click('button:has-text("Send")');

    // Verify message appears
    await expect(page.locator('.message-bubble:last-child')).toContainText('Hello, how are you?');

    // Wait for AI response (with timeout)
    await page.waitForSelector('.message-bubble.ai-message', { timeout: 10000 });
    
    // Verify AI response exists
    const aiMessage = page.locator('.message-bubble.ai-message:last-child');
    await expect(aiMessage).toBeVisible();
  });

  test('should view emotional indicators', async ({ page }) => {
    // Login and navigate to conversation
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');
    await page.click('.relationship-card:first-child');
    await page.waitForURL('**/app/conversation/**');

    // Verify emotional indicators are present
    await expect(page.locator('.emotional-indicator')).toBeVisible();
    
    // Click to expand details
    await page.click('.emotional-indicator');
    
    // Verify details shown
    await expect(page.locator('.emotion-details')).toBeVisible();
  });

  test('should customize relationship settings', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');

    // Navigate to customization
    await page.click('text=Customization');
    await page.waitForURL('**/app/customization');

    // Select relationship to customize
    await page.selectOption('select[name="relationshipId"]', { index: 0 });

    // Update voice settings
    await page.click('input[name="enableVoice"]');
    await page.selectOption('select[name="voiceType"]', 'warm');

    // Update personality traits
    await page.fill('input[name="warmth"]', '80');
    await page.fill('input[name="humor"]', '60');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success
    await expect(page.locator('.success-message')).toContainText('Settings updated');
  });

  test('should view usage statistics', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');

    // Navigate to usage stats
    await page.click('text=Usage Stats');
    await page.waitForURL('**/app/usage-stats');

    // Verify stats are displayed
    await expect(page.locator('h1')).toContainText('Usage Statistics');
    await expect(page.locator('.stat-card')).toHaveCount(4); // Assuming 4 stat cards
    await expect(page.locator('.usage-chart')).toBeVisible();
  });

  test('should update user settings', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');

    // Navigate to settings
    await page.click('text=Settings');
    await page.waitForURL('**/app/settings');

    // Update profile
    await page.fill('input[name="name"]', 'Updated Name');
    await page.selectOption('select[name="language"]', 'es');
    await page.click('input[name="notifications"]');

    // Save
    await page.click('button:has-text("Save Settings")');

    // Verify success
    await expect(page.locator('.success-message')).toContainText('Settings saved');
  });

  test('should handle concurrent conversations', async ({ page, context }) => {
    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');

    // Open first conversation
    await page.click('.relationship-card:first-child');
    await page.waitForURL('**/app/conversation/**');
    const firstConversationUrl = page.url();

    // Open second tab with different conversation
    const page2 = await context.newPage();
    await page2.goto('http://localhost:8080/app/relationships');
    await page2.click('.relationship-card:nth-child(2)');
    await page2.waitForURL('**/app/conversation/**');

    // Send message in first conversation
    await page.fill('textarea[name="message"]', 'Message from tab 1');
    await page.click('button:has-text("Send")');

    // Send message in second conversation
    await page2.fill('textarea[name="message"]', 'Message from tab 2');
    await page2.click('button:has-text("Send")');

    // Verify both messages appear in correct conversations
    await expect(page.locator('.message-bubble:last-child')).toContainText('Message from tab 1');
    await expect(page2.locator('.message-bubble:last-child')).toContainText('Message from tab 2');

    await page2.close();
  });
});
