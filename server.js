const fs = require("fs");
const WebSocket = require("ws");
const AuthManager = require("./Auth/auth");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { loadProxies } = require("./Helpers/functions");

const tokensFilePath = "./Auth/tokens.json";
let tokens = JSON.parse(fs.readFileSync(tokensFilePath, "utf8"));

const userSocket = new WebSocket.Server({ port: 1337 });
console.log("WebSocket server is running on port 1337");

const authManager = new AuthManager();
const clientBots = new Map();

function updateTimeLeft() {
  fs.readFile(tokensFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading tokens file:", err);
      return;
    }

    let tokens = JSON.parse(data);
    let updated = false;

    for (const key in tokens) {
      if (tokens[key].timeLeft > 0) {
        tokens[key].timeLeft -= 60;
        if (tokens[key].timeLeft < 0) {
          tokens[key].timeLeft = 0;
        }
        updated = true;
      }
    }

    if (updated) {
      fs.writeFile(tokensFilePath, JSON.stringify(tokens, null, 2), (err) => {
        if (err) {
          console.error("Error writing tokens file:", err);
        } else {
          console.log("Tokens file updated.");
          notifyClients(tokens);
        }
      });
    }
  });
}

// Function to notify all connected clients with their updated timeLeft
function notifyClients(tokens) {
  const connectedClients = authManager.getConnectedClients();
  connectedClients.forEach(({ token }) => {
    const clientInfo = tokens[token];
    if (clientInfo) {
      const connections = authManager.clientConnections.get(token);
      connections.forEach((ws) => {
        ws.send(
          JSON.stringify({
            type: "update",
            timeLeft: clientInfo.timeLeft,
          })
        );
      });
    }
  });
}

setInterval(updateTimeLeft, 60000);

// Run the first update immediately
updateTimeLeft();

userSocket.on("connection", (ws) => {
  let clientToken = null;
  let lastCoordinates = null;

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "auth") {
        clientToken = data.token;
        const isAuthenticated = await authManager.authenticate(ws, clientToken);

        if (!isAuthenticated) {
          ws.send(
            JSON.stringify({ type: "error", message: "Authentication failed" })
          );
          return;
        }

        // Retrieve client data using the existing methods
        const clientMaxBot = authManager.getClientMaxBot(clientToken);
        const { timeLeft } = authManager.getClientData(clientToken);

        ws.send(
          JSON.stringify({
            type: "success",
            message: "Authenticated successfully",
            ClientMaxBot: clientMaxBot,
            timeLeft: timeLeft, // Send the initial timeLeft
          })
        );

        console.log(`Client authenticated with token: ${clientToken}`);
        clientBots.set(clientToken, []);
        lastCoordinates = null;
      } else if (data.type === "message" && clientToken) {
        // Handle different types of messages
        switch (data.message.type) {
          case "split":
            console.log(
              `Received 'split' command from client with token ${clientToken}`
            );
            ws.send(
              JSON.stringify({
                type: "response",
                message: "Split command executed",
              })
            );
            break;

          case "feed":
            console.log(
              `Received 'feed' command from client with token ${clientToken}`
            );
            ws.send(
              JSON.stringify({
                type: "response",
                message: "Feed command executed",
              })
            );
            break;

          case "start":
            console.log(
              `Received 'start' command from client with token ${clientToken}`
            );
            const clientMaxBot = authManager.getClientMaxBot(clientToken);

            startBots(clientToken, clientMaxBot);

            ws.send(
              JSON.stringify({
                type: "response",
                message: "Bots spawned",
              })
            );
            break;

          case "stop":
            console.log(
              `Received 'stop bots' command from client with token ${clientToken}`
            );
            stopBots(clientToken);
            ws.send(
              JSON.stringify({
                type: "response",
                message: "All bots stopped",
              })
            );
            break;
          case "updateBotsCount":
            const botCount = countConnectedBots(clientToken);
            ws.send(
              JSON.stringify({
                type: "botCount",
                botCount: botCount,
              })
            );
            break;

          case "coordinates":
            const { x, y } = data.message;
            // console.log(x, y);
            const bots = clientBots.get(clientToken) || [];
            bots.forEach((bot) => bot.move(x, y));
            ws.send(
              JSON.stringify({
                type: "response",
                message: `Coordinates received: x=${x}, y=${y}`,
              })
            );
            break;

          default:
        }
      } else {
      }
    } catch (error) {
      console.error(`Message handling error: ${error}`);
    }
  });

  ws.on("close", () => {
    if (clientToken) {
      authManager.disconnect(ws);
      console.log(`Client with token ${clientToken} disconnected`);
      stopBots(clientToken);
      clientBots.delete(clientToken);
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

setInterval(() => {
  // console.log("Connected clients:", authManager.getConnectedClients());
}, 5000);

/* GOTA BOTS WEBSOCKET */
let gotaVersion = "3.6.4";
let proxies = loadProxies();

// Function to start bots for a specific client
function startBots(clientToken, userMaxBot) {
  const bots = clientBots.get(clientToken) || [];
  for (let i = 0; i < userMaxBot; i++) {
    const bot = new Bot(clientToken);
    bot.start();
    bots.push(bot);
    clientBots.set(clientToken, bots);
    // Connect each bot with a 200ms delay
  }
}
function stopBots(clientToken) {
  const bots = clientBots.get(clientToken) || [];
  bots.forEach((bot) => {
    bot.stop(); // Ensure each bot is stopped
  });
  clientBots.set(clientToken, []); // Clear the bot list
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function countConnectedBots(clientToken) {
  const bots = clientBots.get(clientToken) || [];
  return bots.filter((bot) => bot.connected && !bot.closed).length;
}
// Define your Bot class and its methods
class Bot {
  constructor(clientToken) {
    this.clientToken = clientToken;
    this.server = "wss://212-245-254-51-ip.gota.io:1502/";
    this.proxy = null;
    this.proxyAgent = null;
    this.ws = null;
    this.connected = false;
    this.closed = true;
    this.retryAttempts = 0;
  }

  start() {
    this.connected = false;
    this.closed = false;
    this.proxy = proxies[Math.floor(Math.random() * proxies.length)];
    if (!this.proxy.startsWith("http://")) {
      this.proxy = "http://" + this.proxy;
    }
    this.proxyAgent = new HttpsProxyAgent(this.proxy);
    this.ws = new WebSocket(this.server, { agent: this.proxyAgent });
    this.ws.onopen = this.open.bind(this);
    this.ws.onclose = (event) => this.close(event.code, event.reason);
    this.ws.onerror = this.error.bind(this);
    this.ws.onmessage = this.message.bind(this);
  }

  open() {
    this.connected = true;
    this.closed = false;
    this.retryAttempts = 0;

    setInterval(() => {
      this.sendPacket(Buffer.from([71]));
    }, 30000);
    setInterval(() => {
      this.spawn(this.clientToken);
    }, 200);
  }

  close(code, reason) {
    this.connected = false;
    this.closed = true;
    console.log(
      `${this.proxy} - ${this.clientToken} Disconnected from WebSocket server. Code: ${code}, Reason: ${reason}`
    );

    //this.start();
  }

  error(error) {}

  message(message) {}
  stop() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.closed = true;
  }
  spawn(user) {
    let nick = [`dc:k4z3ee + ${user}`];
    let nicks = nick[~~(Math.random() * nick.length)];
    const buf = Buffer.alloc(2 + (nicks.length + 1) * 2);
    let offset = 0;
    buf.writeUInt8(0, offset++);
    for (let i = 0; i < nicks.length; i++) {
      buf.writeUInt16LE(nicks.charCodeAt(i), offset);
      offset += 2;
    }
    buf.writeUInt16LE(0, offset);
    this.sendPacket(buf);
  }
  move(clientX, clientY) {
    if (this.connected) {
      const randomOffsetX = getRandomInt(-10, 11);
      const randomOffsetY = getRandomInt(-11, 10);
      const buf = Buffer.alloc(9);
      let offset = 0;
      buf.writeUInt8(16, offset++);
      buf.writeInt32LE(clientX + randomOffsetX, offset);
      offset += 4;
      buf.writeInt32LE(clientY + randomOffsetY, offset);
      this.sendPacket(buf);
    }
  }

  sendPacket(buf) {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(Buffer.from(buf));
    }
  }
}
