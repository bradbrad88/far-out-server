const aws = require("aws-sdk");
const gallery = require("../models/gallery");
const BUCKET = "far-out-photography-gallery";
require("dotenv").config();
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.REGION,
});

const removeS3 = async () => {
  try {
    console.log("cleaning s3");
    let currentKeys = await gallery.getAwsKeys();
    currentKeys = currentKeys[0].map(key => key.aws_key);
    const res = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
    const awsKeys = res.Contents.map(awsObj => awsObj.Key);
    const deleteKeys = awsKeys
      .filter(key => {
        return !currentKeys.includes(key);
      })
      .map(key => ({
        Key: key,
      }));
    console.log("delete keys", deleteKeys);
    const params = {
      Bucket: BUCKET,
      Delete: {
        Objects: deleteKeys,
      },
    };
    if (deleteKeys.length < 1) return console.log("---- S3 already clean ----");
    const response = await s3.deleteObjects(params).promise();
    console.log("response", response);
  } catch (error) {
    console.log(error);
  }
};

module.exports = removeS3;
