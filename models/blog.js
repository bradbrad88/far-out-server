const query = require("../db");
const sql = require("./sql").blog;

// exports.getGallery = async () => {
//   try {
//     const result = await query(sql.get());
//     const options = await query(sql.getColumnOptions());
//     return [{ imageGallery: result.rows, options: options.rows[0] }, null];
//   } catch (error) {
//     return [null, error.message];
//   }
// };

exports.newBlog = async blog => {
  try {
    const result = await query(sql.newBlog(blog));
    return [true, null];
  } catch (error) {
    return [null, error.message];
  }
};
