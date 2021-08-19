const query = require("../db");
const gallery = require("../models/gallery");
const sharp = require("sharp");
const aws = require("aws-sdk");
const EventEmitter = require("events");
const path = require("path");
const BUCKET = "far-out-photography-gallery";
require("dotenv").config();
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.REGION,
});
const THUMBNAIL_WIDTH = 1000;
const HIGHRES_WIDTH = 4000;

class ImageUpload extends EventEmitter {
  constructor(image, imageData) {
    super();
    this.status = [];
    this.image = image;
    this.imageData = imageData;
    this.retries = 0;
    this.urls = {};
    this.valid = this.validImage();
    this.fileExtension = this.getFileExtension();
    this.dbId = new Promise(this.getDbId);
    this.aspectRatio = new Promise(this.getAspectRatio);
  }

  async getStatus() {
    const image_id = await this.dbId;
    const aspect_ratio = await this.aspectRatio;
    const status = this.status.map(item => ({
      step: item.step,
      progress: item.progress,
      complete: item.complete,
      inProgress: item.inProgress,
      error: item.error,
    }));
    const complete = this.status.filter(status => !status.complete).length === 0;
    if (this.error) this.emit("error", image_id);
    if (complete) this.emit("complete", image_id);
    return JSON.stringify({
      key: this.key,
      status: status,
      error: this.error,
      complete: complete,
      image_id: image_id,
      url: this.url,
      aspect_ratio,
    });
  }

  async validImage() {}

  getDbId = async (resolve, reject) => {
    try {
      const { key, user, description } = this.imageData;
      Object.assign(this, { key, user });
      const type = this.image.mimetype;
      if (!key || !type || !user) {
        console.log("Error: essential data missing from image, unable to upload.");
        return reject(null);
      }
      if (!type === "image/jpeg" && !type === "image/png") {
        console.log("Error: incorrect file type: ", type);
        return reject(null);
      }
      const dbId = await gallery.newImage(description, user.user_id);
      if (dbId[0]) {
        resolve(dbId[0]);
      } else {
        reject(dbId[1]);
      }
    } catch (error) {
      console.log("Error validating image for upload: ", error.message);
      this.error = error.message;
      return reject(null);
    }
  };

  getAspectRatio = async (resolve, reject) => {
    try {
      const { width, height } = await sharp(this.image.buffer).metadata();
      const aspectRatio = width / height;
      resolve(aspectRatio);
    } catch (error) {
      reject(error);
    }
  };

  async processUpload() {
    this.status = [
      new ThumbnailBuffer(this),
      new HighresBuffer(this),
      new UploadThumbnail(this),
      new UploadHighres(this),
      new UpdateDB(this),
    ];

    this.status.forEach(step => {
      step.init();
    });
  }

  generateFilename() {
    return `${Date.now().toString()}${this.fileExtension}`;
  }

  getFileExtension() {
    if (!this.valid) return;
    return path.extname(this.image.originalname);
  }
}

class Status {
  constructor(Image, step) {
    this.complete = false;
    this.progress = 0;
    this.step = step;
    this.inProgress = false;
    this.Image = Image;
    this.update = statusChange => {
      statusChange();
      this.Image.emit("update", this.Image.getStatus());
    };
  }
}

class ThumbnailBuffer extends Status {
  constructor(Image) {
    super(Image, "Generate Thumbnail");
  }

  async init() {
    this.Image.thumbnailBuffer = new Promise(async (resolve, reject) => {
      this.update(() => (this.inProgress = true));
      try {
        const buffer = await sharp(this.Image.image.buffer)
          .resize({ width: THUMBNAIL_WIDTH })
          .toBuffer();
        this.update(() => (this.complete = true));
        resolve(buffer);
      } catch (error) {
        console.log("Error:", error.message);
        this.Image.error = "Unable to render thumbnail image";
        this.update(() => (this.error = true));
        reject(error.message);
      }
    });
  }
}

class HighresBuffer extends Status {
  constructor(Image) {
    super(Image, "Generate High-res");
  }

  async init() {
    this.Image.highresBuffer = new Promise(async (resolve, reject) => {
      this.update(() => (this.inProgress = true));
      try {
        const buffer = await sharp(this.Image.image.buffer)
          .resize({ width: HIGHRES_WIDTH })
          .toBuffer();
        this.update(() => (this.complete = true));
        resolve(buffer);
      } catch (error) {
        console.log("Error:", error.message);
        this.Image.error = "Unable to render highres image";
        this.update(() => (this.error = true));
        reject(error.message);
      }
    });
  }
}

class UploadThumbnail extends Status {
  constructor(Image) {
    super(Image, "Upload Thumbnail");
  }
  async init() {
    this.Image.urls.thumbnail = new Promise(async (resolve, reject) => {
      try {
        this.update(() => (this.inProgress = true));
        const body = await this.Image.thumbnailBuffer;

        const params = {
          Body: body,
          Bucket: BUCKET,
          Key: this.Image.generateFilename(),
          ACL: "public-read",
        };
        const options = { partSize: 5 * 1024 * 1024, queueSize: 4 };
        const response = await s3
          .upload(params, options)
          .on("httpUploadProgress", progress => {
            this.update(
              () => (this.progress = (progress.loaded / progress.total) * 100)
            );
          })
          .promise();
        const result = {
          location: response.Location,
          key: response.Key,
          bucket: response.Bucket,
          resolution: "thumbnail",
        };
        this.Image.url = response.Location;
        this.update(() => (this.complete = true));
        resolve(result);
      } catch (error) {
        console.log("Error:", error.message);
        this.Image.error = "Unable to upload thumbnail.";
        this.update(() => (this.error = true));
        reject(error.message);
      }
    });
  }
}

class UploadHighres extends Status {
  constructor(Image) {
    super(Image, "Upload Hi-res Image");
  }
  async init() {
    this.Image.urls.highres = new Promise(async (resolve, reject) => {
      try {
        this.update(() => (this.inProgress = true));
        const body = await this.Image.highresBuffer;
        const params = {
          Body: body,
          Bucket: BUCKET,
          Key: this.Image.generateFilename(),
          ACL: "public-read",
        };
        const options = { partSize: 5 * 1024 * 1024, queueSize: 1 };
        const response = await s3
          .upload(params, options)
          .on("httpUploadProgress", progress => {
            this.update(
              () => (this.progress = (progress.loaded / progress.total) * 100)
            );
          })
          .promise();
        const result = {
          location: response.Location,
          key: response.Key,
          bucket: response.Bucket,
          resolution: "highres",
        };
        this.update(() => (this.complete = true));
        resolve(result);
      } catch (error) {
        console.log("Error:", error.message);
        this.Image.error = "Unable to upload thumbnail.";
        this.update(() => (this.error = true));
        reject(error.message);
      }
    });
  }
}

class UpdateDB extends Status {
  constructor(Image) {
    super(Image, "Update Database");
  }
  async init() {
    try {
      const urls = await Promise.all(Object.values(this.Image.urls));
      const image_id = await Promise.resolve(this.Image.dbId);
      const aspectRatio = await this.Image.aspectRatio;
      console.log(aspectRatio);
      this.update(() => (this.inProgress = true));
      const data = urls.map(url => {
        return [image_id, url.location, url.key, url.bucket, url.resolution];
      });
      const urlResult = await gallery.addUrls(data);
      const completeResult = await gallery.setComplete(image_id, aspectRatio);
      this.update(() => (this.complete = true));
    } catch (error) {
      this.Image.error = "Error updating database.";
      this.update(() => (this.error = true));
      console.log("Error:", error.message);
    }
  }

  queryPrep(data) {
    return `${data.map(item => {
      return `(${item.map(el => {
        return `'${el}'`;
      })})`.toString();
    })}`;
  }
}

module.exports = ImageUpload;
