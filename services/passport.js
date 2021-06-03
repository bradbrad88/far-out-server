const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const query = require("../db");
require("dotenv").config();
// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: process.env.JWT_SECRET,
};
const userQuery = {
  text: `
    SELECT 
      user_id
    , given_name
    , family_name
    , email
    , image_url
    FROM users
    WHERE user_id = $1
`,
  values: [],
};
// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    userQuery.values = payload.sub;
    const user = await query(userQuery);
    console.log("user:", user);
    if (user.rows?.length > 0) {
      done(null, user.rows);
    }
    done(null, false);
  } catch (error) {
    done(error, false);
  }

  // done(err, user||false)
});

// Tell passport to use this strategy
passport.use(jwtLogin);
