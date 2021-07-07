const query = require("../db");
const sql = require("./sql").comments;

exports.newComment = async (user, comment) => {
  try {
    const result = await query(sql.newComment(user, comment));
    return [result.rows[0].comment_id, null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.getImage = async image_id => {
  try {
    const result = await query(sql.getImage(image_id));
    return [result.rows, null];
  } catch (error) {
    return [null, error.message];
  }
};
