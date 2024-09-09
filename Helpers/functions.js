const fs = require("fs");

function loadAuthorizedTokens() {
  try {
    const data = fs.readFileSync("./Auth/tokens.json", "utf-8");
    const tokens = JSON.parse(data);

    if (typeof tokens !== "object" || tokens === null) {
      throw new Error("Tokens data is not an object");
    }

    // Extract only the tokens (values)
    const tokenValues = Object.values(tokens);
    return tokenValues;
  } catch (error) {
    console.error("Error loading authorized tokens:", error);
    return []; // Return an empty array if there's an error
  }
}

   fuction sendRequest(agent) {
  try {
    // Launch Puppeteer browser instance with proxy settings
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: [
        `--proxy-server=${agent}`, // Set the proxy server
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    // Open a new page
    const page = await browser.newPage();

    // Set the user agent to mimic a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    // Navigate to the target URL
    await page.goto('https://gota.io', { waitUntil: 'networkidle2' });

    // Optionally, you can print the page content or take other actions
    // const content = await page.content();
    // console.log(content);

    console.log('Request to `gota.io` was successful using proxy:', proxyUrl);

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error('Error during the request process:', error);
  }
}

function loadProxies() {
  const proxies = fs
    .readFileSync("./proxies.txt", "utf-8")
    .split("\n")
    .map((proxy) => proxy.trim())
    .filter((proxy) => proxy.length > 0);
  console.log(`Proxies reloaded: ${proxies.length} proxies`);
  return proxies;
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
module.exports = {
  loadAuthorizedTokens,
  loadProxies,
  getRandomInt,
};
