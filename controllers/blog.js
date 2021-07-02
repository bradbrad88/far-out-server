const blog = require("../models/blog");
const { imageHandler } = require("../services/blogImageHandler");

exports.newBlog = async (req, res, next) => {
  const errMessage = "Error returned from database when adding new blog";
  const func = async () => {
    return await blog.newBlog(req.body);
  };
  processResults(res, func, errMessage);
};

exports.editBlog = async (req, res, next) => {
  const errMessage = "Error returned from database when editing a blog";
  const func = async () => {
    return await blog.editBlog(req.body);
  };
  processResults(res, func, errMessage);
};

exports.getActiveBlogs = async (req, res, next) => {
  const errMessage = "Error returned from database when getting active blogs";
  const func = async () => {
    return await blog.getActiveBlogs();
  };
  processResults(res, func, errMessage);
};

exports.getAllBlogs = async (req, res, next) => {
  const errMessage = "Error returned from database when getting active blogs";
  const func = async () => {
    return await blog.getAllBlogs();
  };
  processResults(res, func, errMessage);
};

exports.getBlog = async (req, res, next) => {
  const errMessage = "Error returned from database when retrieving blog post";
  const func = async () => {
    return await blog.getBlog(req.params.blog_id);
  };
  processResults(res, func, errMessage);
};

exports.uploadImage = async (req, res, next) => {
  const result = await imageHandler(req.file);
  res.status(200).json(result);
};

exports.setActive = async (req, res, next) => {
  const errMessage =
    "Error returned from database when setting active property on blog post";
  const func = async () => {
    return await blog.setActive(req.body.blog_id, req.body.active);
  };
  processResults(res, func, errMessage);
};

exports.deleteBlog = async (req, res, next) => {
  const errMessage = "Error returned from database when trying to delete blog post";
  const func = async () => {
    return await blog.deleteBlog(req.params.blog_id);
  };
  processResults(res, func, errMessage);
};

exports.setImageUrls = async (req, res, next) => {
  const errMessage =
    "Error returned from database when setting image urls for blog post";
  const func = async () => {
    return await blog.setImageUrls(req.params.blog_id, req.body);
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
