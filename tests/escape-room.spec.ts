import { test, expect } from '@playwright/test';

test.describe('Escape Room', () => {
  test('should load escape room builder page', async ({ page }) => {
    await page.goto('/escape-room');
    
    
    await expect(page.locator('h2')).toContainText('Escape Room Builder');
    
    
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
    
    
    await expect(page.getByText('Easy Mode')).toBeVisible();
    await expect(page.getByText('Medium Mode')).toBeVisible();
    await expect(page.getByText('Hard Mode')).toBeVisible();
  });

  test('should create and start escape room game', async ({ page }) => {
    await page.goto('/escape-room');
    
    
    await page.locator('input[type="text"]').first().fill('Test Escape Room');
    
    
    const challengeButtons = page.locator('button').filter({ hasText: 'Format the Code' });
    await challengeButtons.first().click();
    
    
    await page.getByText('Start Escape Room').click();
    
    
    await page.waitForTimeout(1000);
    
    
    await expect(page.locator('text=/\\d+:\\d+/')).toBeVisible();
    
    
    await expect(page.locator('h3')).toBeVisible();
    
    
    await expect(page.locator('textarea')).toBeVisible();
    
    
    await expect(page.getByText('Submit Answer')).toBeVisible();
  });
});