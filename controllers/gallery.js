const gallery = require("../models/gallery");
exports.getGallery = async (req, res, next) => {
  try {
    const result = await gallery();

    res.send(result);
  } catch (error) {
    res.send({ error: error.message });
    console.log(error);
  }
};
