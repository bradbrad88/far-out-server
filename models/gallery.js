const query = require("../db");
const sql = require("./sql").gallery;

exports.getGallery = async () => {
  try {
    const result = await query(sql.get());
    return [result.rows, null];
  } catch (error) {
    return [null, error];
  }
};

exports.deleteItems = async image_ids => {
  try {
    await query(sql.delete(image_ids));
    return [true, null];
  } catch (error) {
    console.log(error.message);
    return [null, error];
  }
};

exports.getAll = async () => {
  try {
    const result = await query(sql.getAll());
    return [result.rows, null];
  } catch (error) {
    return [null, error];
  }
};

exports.setComplete = async (image_id, aspectRatio) => {
  try {
    await query(sql.setComplete(image_id, aspectRatio));
    return [true, null];
  } catch (error) {
    console.log("Error in query setting image as complete");
    return [null, error.message];
  }
};

exports.newImage = async (user, count) => {
  try {
    const result = await query(sql.newImage(user, count));
    return [result.rows, null];
  } catch (error) {
    console.log("Error adding new image:", error.message);
    return [null, error.message];
  }
};

exports.addUrls = async data => {
  try {
    await query(sql.addUrls(data));
    return [true, null];
  } catch (error) {
    console.log("Error adding new image urls to the database");
    return [null, error.message];
  }
};

exports.getAwsKeys = async (image_id, emphasize, display_order) => {
  try {
    const result = await query(sql.getAwsKeys());
    return [result.rows, null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.setDisplay = async displayData => {
  try {
    await query(sql.setDisplay(displayData));
    return [true, null];
  } catch (error) {
    console.log(error);
    return [null, error.message];
  }
};
