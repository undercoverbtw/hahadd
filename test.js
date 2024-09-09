const puppeteer = require('puppeteer');

// Define the async function
async function makeRequest(url) {
  try {
    const browser = await puppeteer.launch({
      headless: false, // Run in headful mode to mimic a real browser
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();

    // Set the user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    // Navigate to the target URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0 // Disable the timeout for navigating
    });

    // Optional: You can add extra delays or actions if needed
    await page.waitForTimeout(10000); // Wait for 10 seconds

    // Check if the page content includes signs of Cloudflare challenge
    const content = await page.content();
    const cloudflareChallengePatterns = [
      /Checking your browser/i,
      /Please enable JavaScript/i,
      /Access denied/i,
      /Your connection is not private/i,
      /Security check/i
    ];

    const isCloudflareChallenge = cloudflareChallengePatterns.some(pattern => pattern.test(content));

    if (isCloudflareChallenge) {
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
