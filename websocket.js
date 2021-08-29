const WebSocket = require("ws");
const verifyClient = require("./services/verifyWsClient");
require("dotenv").config();
let port = process.env.PORT || 5000;
port++;
const galleryWss = new WebSocket.Server({
  port: port,
  verifyClient: verifyClient,
  path: "/gallery",
});
console.log("Webserver running on", port);

module.exports.galleryWss = galleryWss;
