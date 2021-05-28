const WebSocket = require("ws");
const helmet = require("helmet");
const cors = require("cors");
const express = require("express");
const { response } = require("express");
const app = express();
const ImageUploadHandler = require("./imageUploadHandler");
const db = require("./db");

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/gallery", async (req, res, next) => {
  const query = `SELECT a.image_id, a.display_order, b.url 
    FROM image_gallery a join image_urls b ON a.image_id = b.image_id 
    WHERE b.resolution = 'thumbnail'`;
  const result = await db(query);
  res.json(result.rows);
});

app.listen(5000);

const imageUpload = new ImageUploadHandler();

const wss = new WebSocket.Server({ port: 3001 });
wss.on("connection", ws => {
  imageUpload.sendUpdate = imageUpdate => {
    ws.send(JSON.stringify(imageUpdate));
  };

  ws.onclose = () => {
    console.log("connection closed");
  };
  ws.onmessage = ({ data }) => {
    imageUpload.newImage(data);
  };
  console.log("new connection");
});
