const puppeteer = require('puppeteer');

// Define the async function
async function makeRequest(url) {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: [
        '--no-sandbox', // Disable sandboxing (useful for some environments)
        '--disable-setuid-sandbox' // Required in some cases
      ]
    });

    const page = await browser.newPage();

    // Set the user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    // Navigate to the target URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    // Fetch the page content
    const content = await page.content();

    // Extract version information from the page content
    // Adjust the selector based on the actual location of the version number
    const versionSelector = 'selector-for-version-element'; // Replace with actual selector
    const versionElement = await page.$(versionSelector);
    const versionText = versionElement ? await page.evaluate(el => el.textContent) : '';

    const versionPattern = /3\.6\.4/; // Pattern to match the version number

    if (versionPattern.test(versionText)) {
      console.log(`Version ${versionText.trim()} successfully fetched from ${url}`);
    } else {
      console.log('Version 3.6.4 not found on the page.');
    }

    await browser.close();
  } catch (error) {
    console.error('Error during the request process:', error);
  }
}

// Call the function with example arguments
(async () => {
  const url = 'https://gota.io'; // Replace with the target URL

  await makeRequest(url);
})();
