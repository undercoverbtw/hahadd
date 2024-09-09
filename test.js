const puppeteer = require('puppeteer');

async function makeRequest(url) {
    try {
        const browser = await puppeteer.launch({
            headless: false, // Set to false to see the browser window
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();

        // Set the user agent to mimic a real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        // Add extra headers if needed
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive'
        });

        // Navigate to the target URL and wait for Cloudflare to handle challenges
        await page.goto(url, {
            waitUntil: 'networkidle2'
        });

        console.log(`Successfully accessed ${url}`);

        // Take a screenshot (optional, for debugging)
        await page.screenshot({ path: 'screenshot.png' });

        await browser.close();
    } catch (error) {
        console.error('Error during the request process:', error);
    }
}

// Example usage
(async () => {
    const urlToAccess = 'https://gota.io'; // Replace with the actual URL you want to access
    await makeRequest(urlToAccess);
})();
