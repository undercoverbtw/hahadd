const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Increase the timeout and wait until the page has fully loaded
    await page.goto('https://gota.io', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Capture the page content
    const content = await page.content();
    
    // Replace with a unique content check
    if (content.includes('Unique content indicating successful page load')) {
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
