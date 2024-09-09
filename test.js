const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Navigate to the website
    await page.goto('https://gota.io', { waitUntil: 'networkidle2' });
    
    // Check for specific content or elements to verify successful access
    const content = await page.content();
    
    if (content.includes('Some specific content or element indicating success')) {
      console.log('Successful');
    } else {
      console.log('Failed to bypass Cloudflare');
    }
  } catch (error) {
    console.error('Error accessing the page:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
