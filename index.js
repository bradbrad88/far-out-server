const WebSocket = require("ws");
const helmet = require("helmet");
const express = require("express");
const { response } = require("express");
const app = express();

app.use(helmet());
app.use(express.urlencoded());

app.get("/gallery", () => {
  response.send("<div>Hey</div>");
});

app.listen(3000);
