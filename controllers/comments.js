const process = require("../services/controllerProcessing");
const comments = require("../models/comments");

exports.newComment = async (req, res, next) => {
  errMessage = "Error returned from database when adding new comment";
  const func = () => {
    return await comments.newComment(req.user, req.body);
  };
  process(res, func, errMessage);
};
