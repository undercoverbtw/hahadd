const web_socket = require("ws");
const { HttpsProxyAgent } = require("https-proxy-agent");
const https = require("https");
const http = require('http');
const fs = require("fs");


const server = http.createServer();
const wss = new web_socket.Server({ server });

function loadProxies() {
  const proxies = fs
    .readFileSync("./proxies.txt", "utf-8")
    .split("\n")
    .map((proxy) => proxy.trim())
    .filter((proxy) => proxy.length > 0);
  console.log(`Proxies reloaded: ${proxies.length} proxies`);
  return proxies;
}

  function _0xC2A3(_0xA49B, _0xA4D9, _0xA4BA) {
      for (var _0xA47C = 0; _0xA47C < _0xA4BA.length; _0xA47C++) {
        _0xA4D9.setUint8(_0xA49B, _0xA4BA.charCodeAt(_0xA47C));
        _0xA49B++;
      };
      _0xA4D9.setUint8(_0xA49B, 0);
    }

function _0xC284(_0xA49B, _0xA4D9, _0xA4BA) {
      for (var _0xA47C = 0; _0xA47C < _0xA4BA.length; _0xA47C++) {
        _0xA4D9.setUint16(_0xA49B, _0xA4BA.charCodeAt(_0xA47C), true);
        _0xA49B += 2;
      };
      _0xA4D9.setUint16(_0xA49B, 0, true);
    }

let bots = [];
let botsAmount = 200;
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
    console.log(`Connected Bots: ${aliveBots}`);

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

     class Bot {
    constructor() {
   this.server = "wss://212-245-254-51-ip.gota.io:1501/"
      this.proxy = null;
      this.proxy_agent = null;
      this.ws = null;
      this.in_connect = false;
      this.closed = true;
      this.interval = null;
    }

    start() {

      if (!botsRunning) return;

       this.proxy = proxies[Math.floor(Math.random() * proxies.length)];

    // Split the proxy string into components
    const proxyParts = this.proxy.split(":");
    const host = proxyParts[0];
    const port = proxyParts[1];
    const username = proxyParts[2];
    const password = proxyParts[3];

    const proxyUrl = `http://${username}:${password}@${host}:${port}`;
    this.proxyAgent = new HttpsProxyAgent(proxyUrl);
      
      const user_agents_list = [
         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
        ]

      this.in_connect = true;
        

      const options = {
          agent: this.proxyAgent,
          headers: {
            "User-Agent":
              user_agents_list[Math.floor(Math.random() * user_agents_list.length)],
            Origin: "https://gota.io/web",
            'Sec-WebSocket-Extensions':
              'permessage-deflate; client_max_window_bits',
          },
        };

       
        this.ws = new web_socket(this.server, options);
        this.ws.onopen = this.on_connect.bind(this);
        this.ws.onclose = (event) => this.close(event.code, event.reason); // Properly handle close event
        this.ws.onerror = this.error.bind(this);
        this.ws.onmessage = this.message.bind(this);
      }




     on_connect() {
      this.inConnect = false;
      this.closed = false;

      this.connectionStart();

      this.sendPing();

      this.sendOptions();

     //this.sendSpectate();

       this.interval = setInterval(() => {
          this.sendPing();
       }, 10000);

    }

    send_packet(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
       }
    };

  sendPing = function() {
    var _0xA47C = new ArrayBuffer(1);
    var _0xA49B = new DataView(_0xA47C);
    _0xA49B.setUint8(0, 71);
     console.log("PING SENTT");
    return _0xA47C;

  };

       move(clientX, clientY) {
    const buf = Buffer.alloc(9);
    let offset = 0;
    buf.writeUInt8(16, offset++);
    buf.writeInt32LE(clientX, offset);
    offset += 4;
    buf.writeInt32LE(clientY, offset);
    this.send_packet(buf);
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
    _0xC284(1, zeniya, name);

    zeniya.setUint8(2 + name.length * 2 + 1, 1);

    this.send_packet(aluel);
  }

       
splitEject() {
    this.send_packet(Buffer.from([21]));
    this.send_packet(Buffer.from([17]));
  }

  eject() {
    this.send_packet(Buffer.from([21]));
    this.send_packet(Buffer.from([21]));
  }
  connectionStart = function() {
    var _0xA49B = "Gota Web " + "3.6.4";
    var _0xA47C = new ArrayBuffer(1 + _0xA49B.length + 1 + 1);
    var _0xA4BA = new DataView(_0xA47C);
    _0xA4BA.setUint8(0, 255);
    _0xA4BA.setUint8(1, 6);
    _0xC2A3(2, _0xA4BA, _0xA49B);
     console.log("PACKET SENTT");
    return _0xA47C;
  };
  setName = function(_0xA49B) {
    var _0xA47C = new ArrayBuffer(2 + (_0xA49B.length + 1) * 2);
    var _0xA4BA = new DataView(_0xA47C);
    _0xA4BA.setUint8(0, 0);
    _0xC284(1, _0xA4BA, _0xA49B);
    return _0xA47C;
  };

    sendSpectate() {
      this.send_packet(Buffer.from([1, 0, 0]));
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

  sendOptions = function() {
    var _0xA47C = new ArrayBuffer(3);
    var _0xA49B = new DataView(_0xA47C);
    _0xA49B.setUint8(0, 104);
    _0xA49B.setUint16(1, 150, true);
    return _0xA47C;
  };
     } // <-- Missing closing curly brace for class definition 
 
