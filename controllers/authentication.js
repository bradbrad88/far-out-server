const jwt = require("jwt-simple");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userModel = require("../models/user");
require("dotenv").config();
const tokenForUser = user => {
  console.log("user", user);
  if (!user.admin) {
    return null;
  }
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.user_id, iat: timestamp }, process.env.JWT_SECRET);
};
exports.signin = async (req, res) => {
  try {
    const { token } = req.body;
    const verifyOptions = {
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    };
    const ticket = await client.verifyIdToken(verifyOptions);
    const { payload } = ticket;
    // const user = await userModel.getUserGoogle(payload.sub);
    const userInput = {
      givenName: payload.given_name,
      familyName: payload.family_name,
      email: payload.email,
      imageUrl: payload.picture,
      googleId: payload.sub,
      state: {},
    };
    const newUser = await userModel.upsertUserGoogle(userInput);

    res.json({ token: tokenForUser(newUser), profile: userInput });
  } catch (error) {
    res.json({ error: error.message });
    console.log(error.message);
  }
};
exports.authenticated = async (req, res) => {
  res.json({ authenticated: true });
};
