const { blogger } = require("googleapis/build/src/apis/blogger");
const blog = require("../models/blog");

exports.newBlog = async (req, res, next) => {
  const errMessage = "Error returned from database when adding new blog";

  const func = async () => {
    return await blog.newBlog(req.body);
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
