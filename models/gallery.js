const query = require("../db");
const sql = require("./sql").gallery;

// const sql = `SELECT a.image_id, a.display_order, b.url
//     FROM image_gallery a join image_urls b ON a.image_id = b.image_id
//     WHERE b.resolution = 'thumbnail'`;

exports.getGallery = async () => {
  try {
    const result = await query(sql.get());
    return result.rows;
  } catch (error) {
    return error;
  }
};

exports.deleteItems = async image_ids => {
  try {
    const result = await query(sql.delete(image_ids));
    console.log("result:", result);
    return result[1].rows;
  } catch (error) {
    console.log(error.message);
    return { error: error.message };
  }
};
