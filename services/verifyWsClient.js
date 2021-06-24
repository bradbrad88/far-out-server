const jwt = require("jwt-simple");
const users = require("../models/user");
require("dotenv").config();
const verifyClient = async (info, done) => {
  const url = new URL(info.req.url, info.origin);
  const token = url.searchParams.get("auth");
  const decoded = jwt.decode(token, process.env.JWT_SECRET);
  const user = await users.getUserByLocalId(decoded.sub);
  if (!user?.data.admin) return done(null);
  console.log("---authenticated---", user.data.email, user.data.user_id);
  info.req.id = user.data.user_id;
  done(user.data.user_id);
};

module.exports = verifyClient;
