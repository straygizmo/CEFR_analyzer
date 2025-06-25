import { test, expect } from '@playwright/test';

test('Simple vocabulary analyzer test', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  
  // Click vocabulary link
  await page.click('a[href="/vocabulary"]');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'test-results/vocabulary-page.png' });
  
  // Check if the textarea is visible
  const textarea = page.locator('textarea[placeholder*="Enter your text"]');
  console.log('Textarea visible:', await textarea.isVisible());
  
  // Enter simple text (at least 10 words)
  await textarea.fill('The cat sits on the mat and looks very happy today.');
  
  // Check word count
  const wordCount = await page.locator('.text-sm.text-gray-600').first().textContent();
  console.log('Word count:', wordCount);
  
  // Click analyze
  await page.click('button:has-text("Analyze")');
  
  // Wait a bit and take screenshot
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/after-analyze.png' });
  
  // Check for any errors
  const errorElement = page.locator('.text-red-500');
  if (await errorElement.isVisible()) {
    console.log('Error found:', await errorElement.textContent());
  }
  
  // Check if results appear
  const resultsHeading = page.locator('h3:has-text("Estimated CEFR-J Level:")');
  const hasResults = await resultsHeading.isVisible();
  console.log('Results visible:', hasResults);
  
  if (hasResults) {
    const level = await resultsHeading.textContent();
    console.log('Level:', level);
  }
  
  // Get page content for debugging
  const content = await page.content();
  console.log('Page has content:', content.length > 0);
});