const jwt = require("jwt-simple");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userModel = require("../models/user");
require("dotenv").config();
const tokenForUser = user => {
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

    const [user, error] = await userModel.upsertUserGoogle(payload);
    if (error) {
      res.status(500).json({ error });
    }
    res.json({ token: tokenForUser(user), profile: user });
  } catch (error) {
    res.json({ error: error.message });
    console.log("Error:", error.message);
  }
};
exports.authenticated = async (req, res) => {
  res.json({ authenticated: true });
};
