import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('should create escape room via API', async ({ request }) => {
    const response = await request.post('/api/escape-rooms', {
      data: {
        name: 'API Test Room',
        timeLimit: 10,
        challenges: ['format', 'debug'],
        htmlOutput: '<html><body>Test</body></html>'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.name).toBe('API Test Room');
  });

  test('should retrieve all escape rooms', async ({ request }) => {
    const response = await request.get('/api/escape-rooms');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});