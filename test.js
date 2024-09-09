const axios = require('axios');

// Define the async function
async function makeRequest(url) {
  try {
    // Perform a GET request
    const response = await axios.get(url);

    // Define patterns indicating Cloudflare's challenge page
    const cloudflareChallengePatterns = [
      /Checking your browser/i,
      /Please enable JavaScript/i,
      /Access denied/i,
      /Your connection is not private/i,
      /Security check/i
    ];

    // Check if any of the Cloudflare challenge patterns are present
    const content = response.data;
    const isCloudflareChallenge = cloudflareChallengePatterns.some(pattern => pattern.test(content));

    if (isCloudflareChallenge) {
      console.log('Cloudflare challenge detected.');
    } else {
      console.log(`Successfully accessed ${url}`);
    }
  } catch (error) {
    console.error('Error during the request process:', error);
  }
}

// Call the function with example arguments
(async () => {
  const url = 'https://gota.io'; // Replace with the target URL

  await makeRequest(url);
})();
