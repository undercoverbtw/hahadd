const fs = require("fs");

// Load authorized tokens from the file
function loadAuthorizedTokens() {
  try {
    const data = fs.readFileSync("./Auth/tokens.json", "utf-8");
    const tokens = JSON.parse(data);

    if (typeof tokens !== "object" || tokens === null) {
      throw new Error("Tokens data is not an object");
    }

    // Extract tokens, ClientMaxBot, and timeLeft values
    const tokenValues = {};
    for (const [user, userInfo] of Object.entries(tokens)) {
      tokenValues[userInfo.token] = {
        maxBotAmount: userInfo.ClientMaxBot || 1,
        user,
        timeLeft: userInfo.timeLeft || 0, // Default to 0 if not found
        lastUpdate: userInfo.lastUpdate || Date.now(), // Use existing lastUpdate or initialize
      };
    }

    console.log("Authorized tokens loaded:", tokenValues);
    return tokenValues;
  } catch (error) {
    console.error("Error loading authorized tokens:", error);
    return {}; // Return an empty object if there's an error
  }
}

let authorizedTokens = loadAuthorizedTokens();

class AuthManager {
  constructor() {
    this.clientConnections = new Map(); // Map to track connections by token
    this.tokenFilePath = "./Auth/tokens.json";

    // Reload tokens every minute to pick up changes
    setInterval(() => {
      this.reloadAuthorizedTokens();
    }, 60000);
  }

  async authenticate(ws, token) {
    const clientInfo = authorizedTokens[token];

    if (!clientInfo) {
      ws.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
      ws.close();
      return false;
    }

    // Check if token's timeLeft is expired
    if (clientInfo.timeLeft <= 0) {
      ws.send(JSON.stringify({ type: "error", message: "Token expired" }));
      ws.close();
      return false;
    }

    // Ensure the token exists in the map
    if (!this.clientConnections.has(token)) {
      this.clientConnections.set(token, []);
    }

    // Get current connections for the token
    const connections = this.clientConnections.get(token);

    // If there are already 2 connections for this token, deny new connections
    if (connections.length >= 2) {
      ws.send(
        JSON.stringify({ type: "error", message: "Max connections reached" })
      );
      ws.close();
      return false;
    }

    // Add the WebSocket to the token's connections
    connections.push(ws);
    ws.send(
      JSON.stringify({ type: "success", message: "Connected", ...clientInfo })
    );
    return true;
  }

  disconnect(ws) {
    for (const [token, connections] of this.clientConnections.entries()) {
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
        // Remove the token entry if there are no more connections
        if (connections.length === 0) {
          this.clientConnections.delete(token);
        }
        break;
      }
    }
  }

  getClientData(token) {
    const clientInfo = authorizedTokens[token];
    if (clientInfo) {
      return {
        ClientMaxBot: clientInfo.maxBotAmount,
        timeLeft: clientInfo.timeLeft,
      };
    }
    return { ClientMaxBot: 1, timeLeft: 0 }; // Default values if client info not found
  }

  getConnectedClients() {
    const connectedClients = [];
    for (const [token, connections] of this.clientConnections.entries()) {
      if (connections.length > 0) {
        const { maxBotAmount, user, timeLeft } = authorizedTokens[token] || {};
        connectedClients.push({
          token,
          count: connections.length,
          maxBotAmount,
          user,
          timeLeft,
        });
      }
    }
    return connectedClients;
  }

  getClientMaxBot(token) {
    const clientInfo = authorizedTokens[token];
    return clientInfo ? clientInfo.maxBotAmount : 1; // Default to 1 if not found
  }

  saveTokens() {
    try {
      fs.writeFileSync(
        this.tokenFilePath,
        JSON.stringify(authorizedTokens, null, 2)
      );
    } catch (error) {
      console.error("Error saving tokens:", error);
    }
  }

  reloadAuthorizedTokens() {
    authorizedTokens = loadAuthorizedTokens();
  }
}

module.exports = AuthManager;
