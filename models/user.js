const sql = require("./sql");
const query = require("../db");

exports.getUserByLocalId = async user_id => {
  try {
    const result = await query(sql.getUserByLocalId(user_id));
    if (!result.rows) return { data: null };
    return { data: result.rows[0] };
  } catch (error) {
    return { error: error.message };
  }
};

exports.upsertUserGoogle = async user => {
  try {
    const result = await query(sql.upsertUserGoogle(user));
    if (result.rows.length > 1) return;
    return result.rows[0];
  } catch (error) {
    return error;
  }
};
