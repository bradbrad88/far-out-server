const aws = require("aws-sdk");
const BUCKET = "far-out-photography-gallery";
require("dotenv").config();
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.REGION,
});

const sendS3 = async (fileBuffer, fileName, resolution) => {
  const params = {
    Body: fileBuffer,
    Bucket: BUCKET,
    Key: fileName,
    ACL: "public-read",
  };

  try {
    const response = await s3.upload(params).promise();
    console.log(
      "Successful S3 Upload. Key:",
      fileName,
      "URL:",
      response.Location
    );
    return { key: fileName, location: response.Location, resolution };
  } catch (error) {
    console.log("Error: ", error.message);
    return { error: error.message };
  }
};

module.exports = sendS3;
