const query = require("../db");
const sql = require("./sql").comments;

exports.newComment = async (user, comment) => {
  const result = await query(sql.newComment(user, comment));
};
