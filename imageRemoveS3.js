const aws = require("aws-sdk");
const BUCKET = "far-out-photography-gallery";
require("dotenv").config();
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.REGION,
});

const removeS3 = async (fileName) => {
  const params = {
    Bucket: BUCKET,
    Key: fileName,
  };

  try {
    const response = await s3.deleteObject(params).promise();
    return { success: response };
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = removeS3;
