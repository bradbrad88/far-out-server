const WebSocket = require("ws");
const ImageUploadHandler = require("./imageUploadHandler");
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
