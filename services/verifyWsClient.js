const jwt = require("jwt-simple");
const users = require("../models/user");
require("dotenv").config();
const verifyClient = async (info, done) => {
  const url = new URL(info.req.url, info.origin);
  const token = url.searchParams.get("auth");
  const decoded = jwt.decode(token, process.env.JWT_SECRET);
  const [user, error] = await users.getUserByLocalId(decoded.sub);
  if (error) return done(null);
  if (!user.admin) return done(null);
  info.req.id = user.user_id;
  done(user.user_id);
};

module.exports = verifyClient;
