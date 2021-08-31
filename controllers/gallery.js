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
    const res = await gallery.deleteItems(images);
    cleanS3();
    return res;
  };
  process(res, func, errMessage);
};

exports.getAll = async (req, res, next) => {
  const errMessage = "Error returned from database getting all image thumbnails";
  const func = async () => {
    return gallery.getAll();
  };
  process(res, func, errMessage);
};

exports.postImage = async (req, res, next) => {
  const errMessage = "Error returned from database posting new image";
  const func = async () => {
    req.body.user = req.user;
    return await UploadHandler.newImage(req.file, req.body.id);
  };
  process(res, func, errMessage);
};

exports.getNewImageId = async (req, res, next) => {
  const errMessage = "Error returned from database adding new image";
  const func = async () => {
    console.log(req.user);
    const user = req.user.user_id;
    return await gallery.newImage(user);
  };
  process(res, func, errMessage);
};

exports.subscribe = async (req, res, next) => {
  const { id } = req.params;
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.status(200);
  res.flushHeaders();
  res.write("retry: 5000\n\n");
  UploadHandler.subscribe(res, id);
};

exports.setDisplay = async (req, res) => {
  const errMessage = "Error returned from database when updating gallery display";
  const func = async () => {
    return await gallery.setDisplay(req.body);
  };
  process(res, func, errMessage);
};

exports.logImages = async (req, res) => {
  UploadHandler.logImages();
  res.status(204).end();
};
