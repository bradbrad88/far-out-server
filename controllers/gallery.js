const gallery = require("../models/gallery");
const cleanS3 = require("../services/cleanS3");
const ImageUploadHandler = require("../services/imageUploadHandler");
const UploadHandler = new ImageUploadHandler();

exports.getGallery = async (req, res, next) => {
  const errMessage = "Error returned from database when trying to get image gallery";
  const func = async () => {
    return await gallery.getGallery();
  };
  processResults(res, func, errMessage);
};

exports.deleteImage = async (req, res, next) => {
  const errMessage = "Error returned from database deleting image(s)";
  const func = async () => {
    const images = req.body;
    await gallery.deleteItems(images);
    cleanS3();
    return await gallery.getInactive();
  };
  processResults(res, func, errMessage);
};

exports.getInactive = async (req, res, next) => {
  const errMessage = "Error returned from database getting inactive images";
  const func = async () => {
    return gallery.getInactive();
  };
  processResults(res, func, errMessage);
};

exports.addImage = async (req, res, next) => {
  const errMessage = "Error returned from database adding new images";
  const func = async () => {
    req.body.user = req.user;
    return await UploadHandler.newImage(req.file, req.body);
  };
  processResults(res, func, errMessage);
};

exports.setDisplay = async (req, res) => {
  const errMessage = "Error returned from database when updating gallery display";
  const func = async () => {
    return await gallery.setDisplay(req.body);
  };
  processResults(res, func, errMessage);
};

const processResults = async (res, func, errMessage) => {
  try {
    const result = await func();
    if (result[0]) return res.json({ data: result[0] });
    res.json({ error: errMessage });
  } catch (error) {
    res.send({ error: `${errMessage}: ${error.message}` });
  }
};
