const WebSocket = require("ws");
const verifyClient = require("./services/verifyWsClient");
const galleryWss = new WebSocket.Server({
  port: 3001,
  verifyClient: verifyClient,
  path: "/gallery",
});
console.log("webserver running on", 3001);

module.exports.galleryWss = galleryWss;
