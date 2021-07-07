const passportService = require("./passport");
const passport = require("passport");

const requireUser = passport.authenticate("jwt", { session: false });

const isAdmin = (req, res, next) => {
  console.log("require admin: ", req.user);
  if (!req.user.admin) res.status(403).send("Access denied");
  next();
};

exports.requireAdmin = [requireUser, isAdmin];

exports.requireUser = requireUser;
