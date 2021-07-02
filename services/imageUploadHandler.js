const ImageUpload = require("./imageUpload");
const { galleryWss } = require("../websocket");
const { deleteItems } = require("../models/gallery");

class ImageUploadHandler {
  constructor() {
    this.images = [];
    this.wss = galleryWss;
    this.wsInit();
  }
  wsInit() {
    this.wss.on("connection", async (ws, req) => {
      ws.id = req.id;
      this.getStatus(ws);
    });
    this.wss.broadcast = this.broadcast;
  }

  broadcast = status => {
    this.wss.clients.forEach(client => {
      client.send(status);
    });
  };

  onUpdate = async status => {
    this.wss.broadcast(await status);
  };

  getStatus(client) {
    this.images.forEach(async image => {
      client.send(await image.getStatus());
    });
  }

  imageUploadError = id => {
    if (!id) return;
    this.images = this.images.filter(image => image.dbId !== id);
    deleteItems([id]);
  };

  imageUploadComplete = id => {
    this.images = this.images.filter(image => image.dbId !== id);
  };

  async newImage(image, imageData) {
    const newImage = new ImageUpload(image, imageData);
    newImage.on("update", this.onUpdate);
    newImage.on("error", this.imageUploadError);
    newImage.on("complete", this.imageUploadComplete);
    if (!newImage.valid) {
      console.log("Image sent is not valid.");
      return;
    }

    if (this.images.some(image => image.key === newImage.key)) {
      console.log("This image is already being processed, disregarding.");
      return;
    }

    this.images.push(newImage);
    newImage.processUpload();
    const image_id = await newImage.dbId;
    if (image_id) return [image_id, null];
    return [null, "Error getting image_id"];
  }
}

module.exports = ImageUploadHandler;
