const WebSocket = require("ws");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { loadProxies } = require("./Helpers/functions");
const https = require("https");
const http = require('http');
const fs = require("fs");

const server = http.createServer();
const wss = new WebSocket.Server({ server });
let bots = [];
let botsAmount = 20;
let int = null;
let proxies = loadProxies();
let botsRunning = false;

// Handle connection event
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Handle message event
  ws.on("message", (msg) => {
    const data = new Uint8Array(msg).buffer;
    const buf = new DataView(data);
    let offset = 0;

    switch (buf.getUint8(offset++)) {
      case 1:
        console.log("Received message: {1}");
        for (let i in bots) {
          bots[i].splitEject();
        }
        break;
      case 2:
        console.log("Received message: {2}");
        for (let i in bots) {
          bots[i].eject();
          bots[i].sendChat();
        }
        break;
      case 9:
        console.log("Received message: {9}");
        // Generate an array of random delays for each bot
        const spawnDelays = [];
        for (let i = 0; i < bots.length; i++) {
          const randomDelay = Math.floor(Math.random() * 4000); // Random delay between 0 and 10 seconds
          spawnDelays.push(randomDelay);
        }

        // Sort the delays in ascending order to ensure each bot starts at a unique time
        spawnDelays.sort((a, b) => a - b);

        // Start each bot with its respective delay
        for (let i = 0; i < bots.length; i++) {
          setTimeout(() => {
            bots[i].spawn();
          }, spawnDelays[i]);
        }
        break;
      case 10:
        console.log("Received message: {10}");
        startBots();
        proxies = loadProxies();
        break;
      case 11:
        console.log("Received message: {11}");
        stopBotsConnecting();
        break;
      case 16:
        const x = buf.getInt32(1, true);
        const y = buf.getInt32(5, true);
        moveBots(x, y);
        break;
      default:
        console.log("Unknown message");
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(1337, () => {
  console.log("HTTPS server listening on port 1337");
});

const startBots = () => {
  if (botsRunning) return; // Prevent multiple start attempts
  botsRunning = true;

  for (let i = 0; i < botsAmount; i++) {
    bots.push(new Bot());
  }
  console.log(bots.length);

  let b = 0;
  int = setInterval(() => {
    let aliveBots = 0;
    for (let i in bots) if (!bots[i].inConnect && !bots[i].closed) aliveBots++;
    console.clear();
    console.log(`Alive Bots: ${aliveBots}`);

    b++;
    if (b > botsAmount) b = 0;

    if (bots[b] && !bots[b].inConnect && bots[b].closed) {
      bots[b].start();
    }
  }, 180);
};

const stopBotsConnecting = () => {
  if (!botsRunning) return;
  clearInterval(int);
  botsRunning = false;

  for (let i in bots) {
    if (bots[i].inConnect && !bots[i].closed) {
      bots[i].ws.close();
    }
  }
};

const moveBots = (x, y) => {
  const usedCoordinates = new Set();

  const getUniqueCoordinates = () => {
    let uniqueX, uniqueY, key;
    do {
      uniqueX = x + Math.floor(Math.random() * 100) - 50;
      uniqueY = y + Math.floor(Math.random() * 100) - 50;
      key = `${uniqueX},${uniqueY}`;
    } while (usedCoordinates.has(key));
    usedCoordinates.add(key);
    return { uniqueX, uniqueY };
  };

  for (let i in bots) {
    const { uniqueX, uniqueY } = getUniqueCoordinates();
    bots[i].move(uniqueX, uniqueY);
  }
};

class Bot {
  constructor() {
    this.server = "wss://165-79-217-144-ip.gota.io:1507/";
    this.proxy = null;
    this.proxyAgent = null;
    this.ws = null;
    this.inConnect = false;
    this.closed = true;
    this.interval = null;
  }

  start() {
    if (!botsRunning) return;

    this.inConnect = true;
    this.proxy = proxies[Math.floor(Math.random() * proxies.length)];

    // Split the proxy string into components
    const proxyParts = this.proxy.split(":");
    const host = proxyParts[0];
    const port = proxyParts[1];
    const username = proxyParts[2];
    const password = proxyParts[3];

    const proxyUrl = `http://${username}:${password}@${host}:${port}`;
    this.proxyAgent = new HttpsProxyAgent(proxyUrl);
    const userAgentList = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
    ];

    const options = {
      agent: this.proxyAgent,
      headers: {
        "User-Agent":
          userAgentList[Math.floor(Math.random() * userAgentList.length)],
        Origin: "https://gota.io/web",
        'Sec-WebSocket-Extensions':
          'permessage-deflate; client_max_window_bits',
      },
    };
    this.ws = new WebSocket(this.server, options);
    this.ws.onopen = this.open.bind(this);
    this.ws.onclose = (event) => this.close(event.code, event.reason); // Properly handle close event
    this.ws.onerror = this.error.bind(this);
    this.ws.onmessage = this.message.bind(this);
  }

  open() {
    this.inConnect = false;
    this.closed = false;
    this.createConnectionStartPacket("3.6.4");
    this.interval = setInterval(() => {
      this.sendPacket(Buffer.from([71]));
    }, 30000);
  }
  sendChat() {
    this.sendPacket(
      Buffer.from([
        72, 0, 104, 0, 111, 0, 119, 0, 115, 0, 32, 0, 121, 0, 111, 0, 117, 0,
        114, 0, 32, 0, 109, 0, 111, 0, 116, 0, 104, 0, 101, 0, 114, 0, 32, 0,
        110, 0, 111, 0, 110, 0, 111, 0, 120, 0, 32, 0, 63, 0, 63, 0, 0, 0,
      ])
    );
  }

  move(clientX, clientY) {
    const buf = Buffer.alloc(9);
    let offset = 0;
    buf.writeUInt8(16, offset++);
    buf.writeInt32LE(clientX, offset);
    offset += 4;
    buf.writeInt32LE(clientY, offset);
    this.sendPacket(buf);
  }

  spawn() {
    let nicks = [
      "Greetings",
      "Gota supporter",
      "Love",
      "Mystery",
      "StormBots",
      "Haha",
      "Crafted With Skill",
      "StormBots",
      "Community",
      "Affection for Ukraine",
      "Crafted With Skill",
      "DC - k4z3ee",
      "Sweetheart",
      "Smile",
      "Joy",
      "StormBots",
      "Community",
      "Crafted With Skill",
      "Be Right Back",
      "StormBots",
      "NONOXX M0M.",
      "Earth",
      "Crafted With Skill",
      "StormBots",
      "Community",
      "Nature",
      "Nika?",
      "SaSa",
      "DC - k4z3ee",
      "NONOXX",
      "Best",
    ];
    var name = nicks[~~(Math.random() * nicks.length)];
    var aluel = new ArrayBuffer(2 + (name.length + 1) * 2);
    var zeniya = new DataView(aluel);
    zeniya.setUint8(0, 0);
    this.jakey(1, zeniya, name);

    zeniya.setUint8(2 + name.length * 2 + 1, 1);

    this.sendPacket(aluel);
  }

  splitEject() {
    this.sendPacket(Buffer.from([21]));
    this.sendPacket(Buffer.from([17]));
  }

  eject() {
    this.sendPacket(Buffer.from([21]));
    this.sendPacket(Buffer.from([21]));
  }

  jakey(emanda, cameran, janaiah) {
    for (var anesty = 0; anesty < janaiah.length; anesty++) {
      cameran.setUint16(emanda, janaiah.charCodeAt(anesty), true);
      emanda += 2;
    }
    cameran.setUint16(emanda, 0, true);
  }

  spec() {
    this.sendPacket(Buffer.from([1, 0, 0]));
  }

  createConnectionStartPacket(version) {
    const tyquane = "Gota Web " + version;
    const nykeisha = new ArrayBuffer(1 + tyquane.length + 1 + 1);
    const torris = new DataView(nykeisha);

    torris.setUint8(0, 255);
    torris.setUint8(1, 6);

    function shaquail(offset, view, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
      view.setUint8(offset + string.length, 0);
    }

    shaquail(2, torris, tyquane);

    this.sendPacket(nykeisha);
    console.log("PACKET SENTT");
  }

  close(code, reason) {
    this.inConnect = false;
    this.closed = true;
    clearInterval(this.interval);
    console.log(
      `${this.proxy} - Disconnected from WebSocket server. Code: ${code}, Reason: ${reason}`
    );
  }

  error(error) {}

  message(message) {}

  sendPacket(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }
}
