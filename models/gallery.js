const query = require("../db");

const sql = `SELECT a.image_id, a.display_order, b.url 
    FROM image_gallery a join image_urls b ON a.image_id = b.image_id 
    WHERE b.resolution = 'thumbnail'`;

const userQuery = async () => {
  try {
    const result = await query(sql);
    return result.rows;
  } catch (error) {
    return error;
  }
};

module.exports = userQuery;
