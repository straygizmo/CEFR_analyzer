import { test, expect } from '@playwright/test';

test.describe('CVLA Debug Test', () => {
  test('Debug CVLA page', async ({ page }) => {
    console.log('1. Navigating to CVLA...');
    await page.goto('https://cvla.langedu.jp/', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('2. Page loaded, looking for textarea...');
    const textarea = await page.locator('textarea[name="inputText"]');
    console.log('Textarea found:', await textarea.isVisible());
    
    console.log('3. Filling textarea...');
    await textarea.fill('The cat sits on the mat and looks very happy.');
    
    console.log('4. Looking for submit button...');
    const submitButton = await page.locator('input[type="submit"][value="Analyze"]');
    console.log('Submit button found:', await submitButton.isVisible());
    
    console.log('5. Taking screenshot before submit...');
    await page.screenshot({ path: 'test-results/cvla-before-submit.png' });
    
    console.log('6. Clicking submit...');
    await submitButton.click();
    
    console.log('7. Waiting for results...');
    try {
      await page.waitForSelector('div.results', { timeout: 30000 });
      console.log('8. Results appeared!');
      
      await page.screenshot({ path: 'test-results/cvla-after-submit.png' });
      
      // Try to get the HTML of the results
      const resultsHTML = await page.locator('div.results').innerHTML();
      console.log('Results HTML length:', resultsHTML.length);
      
    } catch (error) {
      console.error('Error waiting for results:', error);
      await page.screenshot({ path: 'test-results/cvla-error.png' });
      
      // Get page content to debug
      const pageContent = await page.content();
      console.log('Page content length:', pageContent.length);
    }
  });
  
  test('Debug our analyzer', async ({ page }) => {
    console.log('1. Navigating to our app...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    console.log('2. Clicking vocabulary link...');
    await page.click('a[href="/vocabulary"]');
    
    console.log('3. Waiting for page load...');
    await page.waitForLoadState('networkidle');
    
    console.log('4. Looking for textarea...');
    const textarea = await page.locator('textarea[placeholder*="Enter your text"]');
    console.log('Textarea found:', await textarea.isVisible());
    
    console.log('5. Filling textarea...');
    await textarea.fill('The cat sits on the mat and looks very happy.');
    
    console.log('6. Clicking analyze...');
    await page.click('button:has-text("Analyze")');
    
    console.log('7. Waiting for results...');
    await page.waitForSelector('h3:has-text("Estimated CEFR-J Level:")', { timeout: 15000 });
    
    console.log('8. Getting level...');
    const levelText = await page.locator('h3:has-text("Estimated CEFR-J Level:")').textContent();
    console.log('Level:', levelText);
  });
});