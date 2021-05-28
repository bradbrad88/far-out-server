const ImageUpload = require("./imageUpload");

class ImageUploadHandler {
  constructor() {
    this.images = [];
  }

  newImage(data) {
    const newImage = new ImageUpload(data, this.sendUpdate);

    if (!newImage.valid) {
      console.log("Image sent is not valid.");
      return;
    }

    if (this.images.some((image) => image.key === newImage.key)) {
      console.log("This image is already being processed, disregarding.");
      return;
    }
    this.images.push(newImage);
    newImage.processUpload(this.sendUpdate);
  }

  logImages() {
    this.images.forEach((image) => {
      console.log(image.key, image.type);
    });
  }
}

module.exports = ImageUploadHandler;
