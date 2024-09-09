const fs = require("fs");
const puppeteer = require("puppeteer");

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
