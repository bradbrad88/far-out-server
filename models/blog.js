const query = require("../db");
const sql = require("./sql").blog;

exports.newBlog = async blog => {
  try {
    const result = await query(sql.newBlog(blog));
    return [result.rows[0], null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.editBlog = async blog => {
  try {
    await query(sql.editBlog(blog));
    return [true, null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.getActiveBlogs = async () => {
  try {
    const result = await query(sql.getActiveBlogs());
    return [result.rows, null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.getAllBlogs = async () => {
  try {
    const result = await query(sql.getAllBlogs());
    return [result.rows, null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.getBlog = async blog_id => {
  try {
    const result = await query(sql.getBlog(blog_id));
    return [result.rows[0], null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.setActive = async (blog_id, active) => {
  try {
    const result = await query(sql.setActive(blog_id, active));
    return [true, null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.deleteBlog = async blog_id => {
  try {
    const result = await query(sql.deleteBlog(blog_id));
  } catch (error) {}
};

exports.setImageUrls = async (blog_id, images) => {
  try {
    const result = await query(sql.setImageUrls(blog_id, images));
    return [true, null];
  } catch (error) {
    return [null, true];
  }
};
