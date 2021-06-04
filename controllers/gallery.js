const gallery = require("../models/gallery");
exports.getGallery = async (req, res, next) => {
  try {
    const result = await gallery.getGallery();
    console.log("get gallery");
    res.send(result);
  } catch (error) {
    res.send({ error: error.message });
    console.log(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  const images = req.body;
  console.log(images);
  const result = await gallery.deleteItems(images);
  res.json(result);
  // gallery.
};
