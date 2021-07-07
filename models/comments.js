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
