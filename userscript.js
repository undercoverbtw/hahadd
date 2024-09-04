// ==UserScript==
// @name         HEEEEEEEEE BOTS
// @namespace    http://tampermonkey.net/
// @version      2024-07-25
// @description  try to take over the world!
// @author       You
// @match        https://gota.io/web/
// @match        https://ryuten.io/play/
// @match        https://germs.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gota.io
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let originalWebSocket = window.WebSocket;
  let gotaServer = "";

  const ws = new WebSocket("wss://grandcheat.com:1337/");

  function sendBinaryMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.log("WebSocket is not open.");
    }
  }

  window.addEventListener("keydown", function (event) {
    let message;
    switch (event.key) {
      case "b":
        message = new Uint8Array([10]);
        break;
      case "v":
        message = new Uint8Array([11]);
        break;
      case "1":
        message = new Uint8Array([9]);
        break;

      case "e":
        message = new Uint8Array([1]);
        break;
      case "c":
        message = new Uint8Array([2]);
        break;

      default:
        return;
    }
    sendBinaryMessage(message);
  });

  ws.addEventListener("open", function () {
    console.log("WebSocket connection opened.");
  });

  ws.addEventListener("close", function () {
    console.log("WebSocket connection closed.");
  });

  ws.addEventListener("error", function (error) {
    console.error("WebSocket error:", error);
  });
  function createBuffer(len) {
    return new DataView(new ArrayBuffer(len));
  }

  function sendMouseCoordinates(x, y) {
    const buffer = new ArrayBuffer(9);
    const view = new DataView(buffer);
    view.setUint8(0, 16); // Message type 16
    view.setInt32(1, x, true); // Mouse X
    view.setInt32(5, y, true); // Mouse Y

    ws.send(buffer);
  }

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
      !this.url.includes("wss://grandcheat.com:1337")
    ) {
      let buf = normalizeBuffer(arguments[0]);
      let offset = 0;
      switch (buf.getUint8(offset++)) {
        case 16:
          let x = buf.getInt32(1, true);
          let y = buf.getInt32(5, true);
          sendMouseCoordinates(x, y);
          break;
        default:
          console.log(new Uint8Array(arguments[0]));
          break;
      }
    }
  };
})();
