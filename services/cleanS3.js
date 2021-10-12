const aws = require("aws-sdk");
const gallery = require("../models/gallery");
// const BUCKET = "far-out-photography-gallery";
require("dotenv").config();
const { AWS_KEY_ID, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET } = process.env;
const s3 = new aws.S3({
  accessKeyId: AWS_KEY_ID,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});

const removeS3 = async () => {
  try {
    console.log("---- cleaning s3 ----");
    let currentKeys = await gallery.getAwsKeys();
    if (currentKeys.length < 1) return console.log("---- S3 clean aborted ----");
    currentKeys = currentKeys[0].map(key => key.aws_key);
    const res = await s3.listObjectsV2({ Bucket: AWS_BUCKET }).promise();
    const awsKeys = res.Contents.map(awsObj => awsObj.Key);
    const deleteKeys = awsKeys
      .filter(key => {
        return !currentKeys.includes(key);
      })
      .map(key => ({
        Key: key,
      }));
    const params = {
      Bucket: AWS_BUCKET,
      Delete: {
        Objects: deleteKeys,
      },
    };
    if (deleteKeys.length < 1) return console.log("---- S3 already clean ----");
    const response = await s3.deleteObjects(params).promise();
    console.log("---- S3 cleaned ----");
  } catch (error) {
    console.log(error);
  }
};

module.exports = removeS3;
