const sql = require("./sql");
const query = require("../db");

exports.getUserGoogle = async googleId => {
  const result = await query(sql.getUserGoogle(googleId));
  return result.rows;
};

exports.newUserGoogle = async user => {
  try {
    const result = await query(sql.newUserGoogle(user));
    if (result.rows.length > 1) return;
    return result.rows[0];
  } catch (error) {
    return error;
  }
};
