(function () {
  "use strict";

  const serverUrl = "ws://localhost:8080"; // Replace with your server URL
  const clientToken = "yleo"; // Replace with your client token
  let originalWebSocket = window.WebSocket;

  let connectedBots = 0;
  let endTime = 0;
  let maxBot = 0;
  let ws = null;

  function connectServer() {
    ws = new WebSocket(serverUrl);

    ws.addEventListener("open", () => {
      console.log("Connected to WebSocket server");

      ws.send(JSON.stringify({ type: "auth", token: clientToken }));
      setInterval(() => {
        sendMessage({ type: "updateBotsCount" });
      }, 200);
    });

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "success") {
        let { ClientMaxBot, timeLeft } = data;
        connectedBots = data.connectedBots || 0;
        botsText.textContent = `Bots: ${connectedBots}/${ClientMaxBot}`;
        maxBot = ClientMaxBot;
        if (timeLeft) {
          endTime = Date.now() + timeLeft * 1000;
          localStorage.setItem("endTime", endTime);
          updateCountdown();
        }
      }
      if (data.type === "botCount") {
        console.log(`Current bot count: ${data.botCount}`);
        connectedBots = data.botCount;

        botsText.textContent = `Bots: ${connectedBots}/${maxBot}`;
      }
    });

    ws.addEventListener("close", () => {
      console.log("Disconnected from WebSocket server");
    });

    ws.addEventListener("error", (error) => {
      console.error(`WebSocket error: ${error}`);
    });
  }

  function sendMessage(message) {
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "message", message }));
      } else if (ws.readyState === WebSocket.CONNECTING) {
        console.log("WebSocket is connecting. Message queued.");

        setTimeout(() => sendMessage(message), 1000); // Retry after 1 second
      } else {
        console.error("WebSocket is not open. Message not sent.");
      }
    } else {
      console.error("WebSocket instance is not initialized.");
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "s" || event.key === "S") {
      sendMessage({ type: "start" });
    }
  });

  // Read WS Packets
  window.normalizeBuffer = (buf) => {
    buf = new Uint8Array(buf);
    let newBuf = new DataView(new ArrayBuffer(buf.byteLength));
    for (let i = 0; i < buf.byteLength; i++) {
      newBuf.setUint8(i, buf[i]);
    }
    return newBuf;
  };

  originalWebSocket.prototype._sniff = originalWebSocket.prototype.send;
  originalWebSocket.prototype.send = function () {
    this._sniff.apply(this, arguments);

    if (
      !this.url.includes("127.0.0.1") &&
      !this.url.includes("wss://grandcheat.com/")
    ) {
      let buf = normalizeBuffer(arguments[0]);
      if (buf.byteLength < 9) {
        return;
      }

      let offset = 0;
      try {
        switch (buf.getUint8(offset++)) {
          case 16:
            if (buf.byteLength < 9) {
              return;
            }
            let x = buf.getInt32(1, true);
            let y = buf.getInt32(5, true);
            sendMessage({ type: "coordinates", x, y });

            break;
          default:
            console.log(new Uint8Array(arguments[0]).buffer);
            break;
        }
      } catch (e) {
        console.error("Error processing buffer:", e);
      }
    }
  };

  GM_addStyle(`
                  #custom-gui {
                      position: fixed;
                      top: 0;
                      left: 50%;
                      transform: translateX(-50%);
                      background: rgba(51, 51, 51, 0.6); /* Semi-transparent background */
                      color: #fff;
                      padding: 10px;
                      border-radius: 5px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Changed font family */
                      z-index: 9999;
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                      width: 400px;
                  }
                  #custom-gui button {
                      background: #555;
                      border: none;
                      color: #fff;
                      padding: 5px 10px;
                      border-radius: 3px;
                      cursor: pointer;
                  }
                  #custom-gui button:hover {
                      background: #777;
                  }
              `);

  const gui = document.createElement("div");
  gui.id = "custom-gui";

  const startStopButton = document.createElement("button");
  startStopButton.textContent = "Start";
  startStopButton.addEventListener("click", () => {
    const isStarted = startStopButton.textContent === "Stop";
    startStopButton.textContent = isStarted ? "Start" : "Stop";
    statusText.textContent = `Status: ${isStarted ? "Offline" : "Online"}`;
    if (!isStarted) {
      connectServer();
    }

    sendMessage({ type: isStarted ? "stop" : "start" });
  });

  const statusText = document.createElement("span");
  statusText.textContent = "Status: Offline";

  const botsText = document.createElement("span");
  botsText.textContent = "Bots: 0/0";

  const timeLeftText = document.createElement("span");
  timeLeftText.textContent = "Time Left: 00:00";

  gui.appendChild(startStopButton);
  gui.appendChild(statusText);
  gui.appendChild(botsText);
  gui.appendChild(timeLeftText);

  document.body.appendChild(gui);

  function updateCountdown() {
    const now = Date.now();
    const distance = endTime - now;

    if (distance <= 0) {
      timeLeftText.textContent = "Time Left: 00:00";
      localStorage.removeItem("endTime");
      endTime = 0;
      return;
    }

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    // Update the countdown display
    timeLeftText.textContent = `Time Left: H${hours} M${minutes
      .toString()
      .padStart(2, "0")}`;

    setTimeout(updateCountdown, 60000); // Update every minute
  }

  function loadSavedTimeLeft() {
    const savedEndTime = localStorage.getItem("endTime");
    if (savedEndTime) {
      endTime = parseInt(savedEndTime, 10);
      updateCountdown();
    } else {
      timeLeftText.textContent = "Time Left: 00:00";
    }
  }

  loadSavedTimeLeft();
})();
