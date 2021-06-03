const query = require("./db");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { response } = require("express");
const BUCKET = "far-out-photography-gallery";
require("dotenv").config();
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.REGION,
});

class ImageUpload {
  constructor(message, updateCallback) {
    this.status = [];
    this.retries = 0;
    this.urls = {};
    this.description = "";
    this.valid = this.validImage(message);
    this.fileExtension = this.getFileExtension();
    this.updateCallback = updateCallback;
    this.error = null;
  }

  getStatus() {
    const status = this.status.map(item => {
      return {
        step: item.step,
        progress: item.progress,
        complete: item.complete,
        inProgress: item.inProgress,
      };
    });
    const complete = this.status.filter(status => !status.complete).length === 0;
    return { key: this.key, status: status, error: this.error, complete: complete };
  }

  sendUpdate() {
    const message = this.getStatus();
    this.updateCallback(message);
  }

  validImage(message) {
    try {
      const image = JSON.parse(message);
      Object.assign(this, image);
      if (!this.key || !this.type || !this.data) {
        console.log("Essential data missing from image, unable to upload.");
        return false;
      }
      if (!this.type === "image/jpeg" && !this.type === "image/png") {
        console.log("Incorrect file type: ", this.type);
        return false;
      }
      return true;
    } catch (error) {
      console.log("error validating image for upload: ", error.message);
      return false;
    }
  }

  async processUpload() {
    // setup progress status steps
    this.status = [
      new HighresBuffer(this),
      new ThumbnailBuffer(this),
      new UploadThumbnail(this),
      new UploadHighres(this),
      new UpdateDB(this),
    ];

    this.status.forEach(step => {
      step.init();
    });
  }

  async dbNewEntry() {
    newEntryQuery.values = [
      this.description,
      this.urlThumbnail.location,
      this.urlHighres.location,
    ];
    const imageId = await query(newEntryQuery);
    this.dbId = imageId.rows[0].image_id;
    return this.dbId;
  }

  s3Cleanup() {
    console.log("cleanup initiated");
    const s3Remove = require("./imageRemoveS3");
    if (this.urlHighres?.key) {
      s3Remove(this.urlHighres.key);
    }

    if (this.urlThumbnail?.key) {
      s3Remove(this.urlThumbnail.key);
    }
  }

  generateFilename() {
    return `${Date.now().toString()}.${this.fileExtension}`;
  }

  getFileExtension() {
    let fileExtension = this.type.split("/")[1];
    fileExtension = fileExtension.replace("e", "");
    return fileExtension;
  }

  async retriesWrapper(func, retries) {
    while (this.retries < retries) {
      if (this.retries > 0) console.log("retrying");
      try {
        return await func();
      } catch (error) {
        this.retries++;
        console.log(error.message);
      }
    }
  }
}
class Status {
  constructor(Image, step) {
    this.complete = false;
    this.progress = 0;
    this.step = step;
    this.inProgress = false;
    this.Image = Image;
  }
}
class HighresBuffer extends Status {
  constructor(Image) {
    super(Image, "Generate Buffer");
  }

  async init() {
    this.Image.highresBuffer = new Promise((resolve, reject) => {
      this.inProgress = true;
      this.Image.sendUpdate();
      try {
        const buffer = Buffer.from(this.Image.data, "base64");
        this.complete = true;
        this.Image.sendUpdate();
        resolve(buffer);
      } catch (error) {
        console.log("Unable to convert image data to base64");
        reject(error.message);
      }
    });
  }
}
class ThumbnailBuffer extends Status {
  constructor(Image) {
    super(Image, "Generate Thumbnail");
  }

  async init() {
    this.Image.thumbnailBuffer = new Promise(async (resolve, reject) => {
      this.inProgress = true;
      this.Image.sendUpdate();
      try {
        const buffer = await sharp(await this.Image.highresBuffer)
          .resize({ width: 500 })
          .toBuffer();
        this.complete = true;
        this.Image.sendUpdate();
        resolve(buffer);
      } catch (error) {
        console.log("Error:", error.message);
        this.Image.error = "Unable to render thumbnail image";
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
        this.inProgress = true;
        this.Image.sendUpdate();
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
            this.progress = (progress.loaded / progress.total) * 100;
            this.Image.sendUpdate();
          })
          .promise();
        const result = {
          location: response.Location,
          key: response.Key,
          bucket: response.Bucket,
          resolution: "thumbnail",
        };
        this.complete = true;
        this.Image.sendUpdate();
        resolve(result);
      } catch (error) {
        console.log("Error:", error.message);
        this.Image.error = "Unable to upload thumbnail.";
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
        this.inProgress = true;
        this.Image.sendUpdate();
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
            this.progress = (progress.loaded / progress.total) * 100;
            this.Image.sendUpdate();
          })
          .promise();
        const result = {
          location: response.Location,
          key: response.Key,
          bucket: response.Bucket,
          resolution: "highres",
        };
        this.complete = true;
        this.Image.sendUpdate();
        resolve(result);
      } catch (error) {
        console.log("Error:", error.message);
        this.Image.error = "Unable to upload thumbnail.";
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
    this.Image.dbId = new Promise(async (resolve, reject) => {
      try {
        const urls = await Promise.all(Object.values(this.Image.urls));
        this.inProgress = true;
        this.Image.sendUpdate();
        const parentQuery = {
          text: "INSERT INTO image_gallery (image_desc) VALUES ($1) RETURNING image_id",
          values: [this.Image.description],
        };
        let dbId = await query(parentQuery);
        dbId = dbId.rows[0].image_id;
        const data = urls.map(url => {
          return [dbId, url.location, url.key, url.bucket, url.resolution];
        });
        const urlQuery = `INSERT INTO image_urls (image_id, url, aws_key, bucket, resolution) VALUES ${this.queryPrep(
          data
        )}`;
        query(urlQuery);
        this.complete = true;
        this.Image.sendUpdate();
        resolve("dbId");
      } catch (error) {
        thhis.Image.error = "Error updating database.";
        console.log("Error:", error.message);
        reject(error.message);
      }
    });
  }

  queryPrep(data) {
    return `${data.map(item => {
      return `(${item.map(el => {
        return `'${el}'`;
      })})`.toString();
    })}`;
  }

  // async begin() {
  //   // update the database
  //   const newEntryQuery = {
  //     text: "INSERT INTO image_gallery (image_desc) VALUES ($1) RETURNING image_id",
  //     values: [],
  //   };
  // }
}

module.exports = ImageUpload;

// async (resolve, reject) => {
//   this.inProgress = true;
//   this.Image.sendUpdate();
//   const body = await this.Image.thumbnailBuffer;
//   const params = {
//     Body: body,
//     Bucket: BUCKET,
//     Key: this.Image.generateFilename(),
//     ACL: "public-read",
//   };
//   const options = { partSize: 5 * 1024 * 1024, queueSize: 4 };
//   try {
//     const response = await s3
//       .upload(params, options)
//       .on("httpUploadProgress", (progress) => {
//         this.progress = (progress.loaded / progress.total) * 100;
//         this.Image.sendUpdate();
//       })
//       .promise();
//     const result = {
//       location: response.Location,
//       key: response.Key,
//       bucket: response.Bucket,
//     };
//     resolve(result);
//     this.complete = true;
//     this.Image.sendUpdate();
//   } catch (error) {
//     console.log("Error:", error.message);
//     this.Image.error = "Unable to upload thumbnail.";
//     reject(error.message);
//   }
// }
