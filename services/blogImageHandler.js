const path = require("path");
const sharp = require("sharp");
const aws = require("aws-sdk");
const { file } = require("googleapis/build/src/apis/file");
require("dotenv").config();
const IMG_WIDTH = 1000;
const BUCKET = "far-out-photography-gallery";
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.REGION,
});

module.exports.imageHandler = async file => {
  resizeImage(file);
  const res = await uploadS3Multi(file);
  return {
    url: res.Location,
    success: true,
    bucket: BUCKET,
  };
};

const uploadS3Multi = async file => {
  try {
    const params = {
      Body: file.buffer,
      Bucket: BUCKET,
      Key: generateFilename(file),
      ACL: "public-read",
    };
    return await s3.upload(params).promise();
  } catch (error) {
    console.log("Error:", error.message);
  }
};

const generateFilename = file => {
  return `${Date.now().toString()}${getFileExtension(file)}`;
};

const getFileExtension = file => {
  return path.extname(file.originalname);
};

const resizeImage = async file => {
  const metadata = await sharp(file.buffer).metadata();
  if (metadata.width <= IMG_WIDTH) return;
  file.buffer = await sharp(file.buffer).resize({ width: 1000 }).toBuffer();
};
