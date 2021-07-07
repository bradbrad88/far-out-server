const process = require("../services/controllerProcessing");
const gallery = require("../models/gallery");
const cleanS3 = require("../services/cleanS3");
const ImageUploadHandler = require("../services/imageUploadHandler");
const UploadHandler = new ImageUploadHandler();

exports.getGallery = async (req, res, next) => {
  const errMessage = "Error returned from database when trying to get image gallery";
  const func = async () => {
    return await gallery.getGallery();
  };
  process(res, func, errMessage);
};

exports.deleteImage = async (req, res, next) => {
  const errMessage = "Error returned from database deleting image(s)";
  const func = async () => {
    const images = req.body;
    await gallery.deleteItems(images);
    cleanS3();
    return await gallery.getInactive();
  };
  process(res, func, errMessage);
};

exports.getInactive = async (req, res, next) => {
  const errMessage = "Error returned from database getting inactive images";
  const func = async () => {
    return gallery.getInactive();
  };
  process(res, func, errMessage);
};

exports.getAllImageThumbnails = async (req, res, next) => {
  const errMessage = "Error returned from database getting all image thumbnails";
  const func = async () => {
    return gallery.getAllImageThumbnails();
  };
  process(res, func, errMessage);
};

exports.addImage = async (req, res, next) => {
  const errMessage = "Error returned from database adding new images";
  const func = async () => {
    req.body.user = req.user;
    return await UploadHandler.newImage(req.file, req.body);
  };
  process(res, func, errMessage);
};

exports.setDisplay = async (req, res) => {
  const errMessage = "Error returned from database when updating gallery display";
  const func = async () => {
    return await gallery.setDisplay(req.body);
  };
  process(res, func, errMessage);
};
