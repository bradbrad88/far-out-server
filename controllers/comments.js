const process = require("../services/controllerProcessing");
const comments = require("../models/comments");

exports.newComment = async (req, res, next) => {
  errMessage = "Error returned from database when adding new comment";
  const func = async () => {
    return await comments.newComment(req.user, req.body);
  };
  process(res, func, errMessage);
};

exports.getComments = async (req, res, next) => {
  console.log("get comments");
  errMessage = "Error returned from database when getting comments";
  const func = async () => {
    const [image, blog] = [req.params.image_id, req.params.blog_id];
    if (image) return await comments.getImage(image);
    if (blog) return await comments.getBlog(blog);
  };
  process(res, func, errMessage);
};
