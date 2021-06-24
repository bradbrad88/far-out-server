const passportService = require("./services/passport");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const Authentication = require("./controllers/authentication");
const Gallery = require("./controllers/gallery");
const Blog = require("./controllers/blog");

console.log(upload);

module.exports = app => {
  app.get("/gallery", Gallery.getGallery);
  app.get("/gallery/inactive", requireAuth, Gallery.getInactive);
  app.post("/gallery/delete", requireAuth, Gallery.deleteImage);
  app.post("/gallery/insert", requireAuth, upload.single("image"), Gallery.addImage);
  app.post("/gallery/display", requireAuth, Gallery.setDisplay);
  app.get("/auth", requireAuth, Authentication.authenticated);
  app.post("/auth/google", Authentication.signin);
  app.post("/blog/new", requireAuth, Blog.newBlog);
};
