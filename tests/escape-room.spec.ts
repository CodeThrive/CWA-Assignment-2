import { test, expect } from '@playwright/test';

test.describe('Escape Room', () => {
  test('should load escape room builder page', async ({ page }) => {
    await page.goto('/escape-room');
    
    // Check page title
    await expect(page.locator('h2')).toContainText('Escape Room Builder');
    
    // Check configuration inputs exist
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
    
    // Check preset buttons exist
    await expect(page.getByText('Easy Mode')).toBeVisible();
    await expect(page.getByText('Medium Mode')).toBeVisible();
    await expect(page.getByText('Hard Mode')).toBeVisible();
  });

  test('should create and start escape room game', async ({ page }) => {
    await page.goto('/escape-room');
    
    // Set room name
    await page.locator('input[type="text"]').first().fill('Test Escape Room');
    
    // Select challenges (click first 3)
    const challengeButtons = page.locator('button').filter({ hasText: 'Format the Code' });
    await challengeButtons.first().click();
    
    // Click start button
    await page.getByText('Start Escape Room').click();
    
    // Wait for game to start
    await page.waitForTimeout(1000);
    
    // Check timer is visible
    await expect(page.locator('text=/\\d+:\\d+/')).toBeVisible();
    
    // Check challenge title is visible
    await expect(page.locator('h3')).toBeVisible();
    
    // Check code textarea exists
    await expect(page.locator('textarea')).toBeVisible();
    
    // Check submit button exists
    await expect(page.getByText('Submit Answer')).toBeVisible();
  });
});