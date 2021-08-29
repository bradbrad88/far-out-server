const WebSocket = require("ws");
const verifyClient = require("./services/verifyWsClient");
require("dotenv").config();
const port = process.env.PORT || 5001;
const galleryWss = new WebSocket.Server({
  port: port,
  verifyClient: verifyClient,
  path: "/gallery",
});
console.log("Webserver running on", port);

module.exports.galleryWss = galleryWss;
