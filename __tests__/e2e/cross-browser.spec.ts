import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser and Device Tests', () => {
  // Test on different viewports
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should render correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:8080/login');

      // Verify responsive layout
      await expect(page.locator('form')).toBeVisible();
      
      if (width < 768) {
        // Mobile: burger menu should be visible
        await expect(page.locator('.mobile-menu-button')).toBeVisible();
      } else {
        // Desktop/Tablet: full navigation
        await expect(page.locator('.desktop-nav')).toBeVisible();
      }
    });
  });

  test('should work on Chrome', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('http://localhost:8080/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/app/relationships');
    await expect(page.locator('h1')).toContainText('Relationships');

    await context.close();
  });

  test('should work on Firefox', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('http://localhost:8080/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/app/relationships');
    await expect(page.locator('h1')).toContainText('Relationships');

    await context.close();
  });

  test('should work on Safari', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('http://localhost:8080/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/app/relationships');
    await expect(page.locator('h1')).toContainText('Relationships');

    await context.close();
  });

  test('should handle touch events on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/login');

    // Login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.tap('button[type="submit"]');

    await page.waitForURL('**/app/relationships');

    // Test swipe gestures
    const relationshipCard = page.locator('.relationship-card:first-child');
    const box = await relationshipCard.boundingBox();
    
    if (box) {
      // Swipe left
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x - 100, box.y + box.height / 2);
      await page.mouse.up();
    }
  });

  test('should maintain accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:8080/login');

    // Check for ARIA labels
    await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-label');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('aria-label');

    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);

    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
  });

  test('should handle offline mode gracefully', async ({ page, context }) => {
    await page.goto('http://localhost:8080/login');
    
    // Login first
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/app/relationships');

    // Go offline
    await context.setOffline(true);

    // Try to perform action
    await page.click('.relationship-card:first-child');

    // Verify offline message
    await expect(page.locator('.offline-indicator')).toBeVisible();
    await expect(page.locator('.offline-indicator')).toContainText('No connection');

    // Go back online
    await context.setOffline(false);

    // Verify reconnection
    await expect(page.locator('.offline-indicator')).not.toBeVisible();
  });
});
