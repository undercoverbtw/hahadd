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

    // Disable JavaScript
    await page.setJavaScriptEnabled(false);

    // Set the user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    // Navigate to the target URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    // Fetch the page content
    const content = await page.content();

    // Define a pattern or keyword indicating Cloudflare's challenge page
    const cloudflareChallengePattern = /Checking your browser|Please enable JavaScript|Access denied/i;

    if (cloudflareChallengePattern.test(content)) {
      console.log('Cloudflare challenge detected.');
    } else {
      console.log(`Successfully accessed ${url}`);
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
