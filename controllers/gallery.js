const gallery = require("../models/gallery");
exports.getGallery = async (req, res, next) => {
  try {
    const result = await gallery();
    res.json(result);
  } catch (error) {
    console.log("response:", error);
    res.status(503).send({
      error: "There is an issue with the server, please try again later",
    });
  }
};
