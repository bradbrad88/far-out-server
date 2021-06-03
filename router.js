const db = require("./db");
const Authentication = require("./controllers/authentication");
const passportService = require("./services/passport");
const passport = require("passport");

const requireAuth = passport.authenticate("jwt", { session: false });
const Gallery = require("./controllers/gallery");

module.exports = app => {
  app.get("/gallery", Gallery.getGallery);
  app.get("/auth", requireAuth, Authentication.signin);
  app.post("/auth/google", Authentication.signin);
};
