const puppeteer = require('puppeteer');

// Define the async function
async function makeRequest(url, proxy) {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920x1080', // Set window size to avoid issues with responsive layouts
        `--proxy-server=${proxy}` // Set the proxy server
      ],
      defaultViewport: null // Use default viewport size
    });

    const page = await browser.newPage();

    // Set the user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    // Optional: Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive'
    });

    // Navigate to the target URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0 // Disable the timeout for navigating
    });

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
      console.log(`${proxy} : Successfully accessed ${url}`);
    }

    await browser.close();
  } catch (error) {
    console.error('Error during the request process:', error);
  }
}

// Call the function with example arguments
(async () => {
  const url = 'https://gota.io'; // Replace with the target URL
  const proxy = 'http://43.229.11.86:5724'; // Replace with your proxy server

  await makeRequest(url, proxy);
})();
