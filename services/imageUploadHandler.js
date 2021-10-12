const ImageUpload = require("./imageUpload");
const { galleryWss } = require("../websocket");
const { deleteItems } = require("../models/gallery");

class ImageUploadHandler {
  constructor() {
    this.images = [];
    this.wss = galleryWss;
    this.subscriptions = [];
  }

  subscribe = (res, image_id) => {
    this.subscriptions = [...this.subscriptions, { image_id, res }];
  };

  logImages = () => {
    console.log(
      "images",
      this.images.map(image => image.image)
    );
    console.log(
      "subscriptions",
      this.subscriptions.map(sub => sub.image_id)
    );
  };

  broadcast = status => {
    const subs = this.subscriptions.filter(
      sub => parseInt(sub.image_id) === parseInt(status.image_id)
    );
    subs.forEach(sub => {
      const { res } = sub;
      res.write(`data: ${JSON.stringify(status)}\n\n`);
      if (status.complete) {
        console.log("complete");
        res.write("event: complete\ndata: true\n\n");
        // res.status(204).end();
        this.subscriptions = this.subscriptions.filter(
          subscription => subscription !== sub
        );
      }
    });
  };

  onUpdate = async status => {
    this.broadcast(await status);
  };

  getStatus(client) {
    this.images.forEach(async image => {
      const status = await image.getStatus();
      client.send(status);
    });
  }

  imageUploadError = id => {
    if (!id) return;
    this.images = this.images.filter(image => image.image_id !== id);
    deleteItems([id]);
  };

  imageUploadComplete = id => {
    this.images = this.images.filter(
      image => parseInt(image.image_id) !== parseInt(id)
    );
  };

  async newImage(image, image_id) {
    const newImage = new ImageUpload(image, image_id);
    newImage.on("update", this.onUpdate);
    newImage.on("error", this.imageUploadError);
    newImage.on("complete", this.imageUploadComplete);

    if (this.images.some(image => image.image_id === image_id)) {
      console.log("This image is already being processed, disregarding.");
      return;
    }

    this.images.push(newImage);
    newImage.processUpload();
    return [true, null];
    // const image_id = await newImage.dbId;
    // if (image_id) return [image_id, null];
    // return [null, "Error getting image_id"];
  }
}

module.exports = ImageUploadHandler;
