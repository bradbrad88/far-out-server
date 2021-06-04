const passportService = require("./services/passport");
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const Authentication = require("./controllers/authentication");
const Gallery = require("./controllers/gallery");

module.exports = app => {
  app.get("/gallery", Gallery.getGallery);
  app.get("/auth", requireAuth, Authentication.authenticated);
  app.post("/auth/google", Authentication.signin);
};
