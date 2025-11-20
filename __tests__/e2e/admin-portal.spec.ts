import { test, expect } from '@playwright/test';

test.describe('Admin Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('http://localhost:8080/admin/login');
  });

  test('should login as admin successfully', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/admin/dashboard');
    
    // Verify dashboard is loaded
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display validation errors for invalid login', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'short');
    await page.click('button[type="submit"]');

    // Verify error messages appear
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should navigate to ethical configs page', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    // Navigate to ethical configs
    await page.click('text=Ethical Configurations');
    await page.waitForURL('**/admin/ethical-configs');

    // Verify page content
    await expect(page.locator('h1')).toContainText('Ethical Configurations');
  });

  test('should create new ethical configuration', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    // Navigate to ethical configs
    await page.click('text=Ethical Configurations');
    await page.waitForURL('**/admin/ethical-configs');

    // Click create button
    await page.click('button:has-text("Create Configuration")');

    // Fill form
    await page.fill('input[name="name"]', 'Test Config');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.fill('input[name="rules"]', 'No harmful content');
    await page.click('button:has-text("Add Rule")');
    await page.fill('input[name="rules"]', 'Be respectful');
    await page.click('button:has-text("Add Rule")');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Configuration created');
  });

  test('should update existing ethical configuration', async ({ page }) => {
    // Login and navigate
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    await page.click('text=Ethical Configurations');
    await page.waitForURL('**/admin/ethical-configs');

    // Click edit on first config
    await page.click('.config-item:first-child button:has-text("Edit")');

    // Update name
    await page.fill('input[name="name"]', 'Updated Config Name');

    // Submit
    await page.click('button[type="submit"]');

    // Verify update
    await expect(page.locator('.success-message')).toContainText('Configuration updated');
  });

  test('should delete ethical configuration', async ({ page }) => {
    // Login and navigate
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    await page.click('text=Ethical Configurations');
    await page.waitForURL('**/admin/ethical-configs');

    // Get initial count
    const initialCount = await page.locator('.config-item').count();

    // Delete first config
    await page.click('.config-item:first-child button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify deletion
    await expect(page.locator('.success-message')).toContainText('Configuration deleted');
    const newCount = await page.locator('.config-item').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should view user analytics', async ({ page }) => {
    // Login and navigate
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
    await page.click('text=User Analytics');
    await page.waitForURL('**/admin/user-analytics');

    // Verify analytics content
    await expect(page.locator('h1')).toContainText('User Analytics');
    await expect(page.locator('.analytics-chart')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    // Logout
    await page.click('button:has-text("Logout")');

    // Verify redirect to login
    await page.waitForURL('**/admin/login');
    await expect(page.locator('h1')).toContainText('Admin Login');
  });
});
