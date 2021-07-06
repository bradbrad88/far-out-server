const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const userModel = require("../models/user");
require("dotenv").config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await userModel.getUserByLocalId(payload.sub);
    if (user.data) {
      return done(null, user.data);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
});

passport.use(jwtLogin);
