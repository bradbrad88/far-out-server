const sql = require("./sql").user;
const query = require("../db");

exports.getUserByLocalId = async user_id => {
  try {
    const result = await query(sql.getUserByLocalId(user_id));
    if (!result.rows) return { data: null };
    return [result.rows[0], null];
  } catch (error) {
    return [null, error.message];
  }
};

exports.upsertUserGoogle = async user => {
  try {
    const result = await query(sql.upsertUserGoogle(user));
    if (result.rows.length > 1) return;
    return [result.rows[0], null];
  } catch (error) {
    return [null, error];
  }
};
