const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Navigate to the website
    await page.goto('https://gota.io', { waitUntil: 'networkidle2' });
    
    // Capture the page content
    const content = await page.content();
    
    // Print or process the content as needed
    console.log(content);
  } catch (error) {
    console.error('Error accessing the page:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
