const passportService = require("./services/passport");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const passport = require("passport");
const requireAuth = passport.authenticate("jwt", { session: false });
const Authentication = require("./controllers/authentication");
const Gallery = require("./controllers/gallery");
const Blog = require("./controllers/blog");

module.exports = app => {
  app.get("/gallery", Gallery.getGallery);
  app.get("/gallery/inactive", requireAuth, Gallery.getInactive);
  app.post("/gallery/delete", requireAuth, Gallery.deleteImage);
  app.post("/gallery/insert", requireAuth, upload.single("image"), Gallery.addImage);
  app.post("/gallery/display", requireAuth, Gallery.setDisplay);
  app.get("/auth", requireAuth, Authentication.authenticated);
  app.post("/auth/google", Authentication.signin);
  app.post("/edit/blog", requireAuth, Blog.newBlog);
  app.put("/edit/blog/", requireAuth, Blog.editBlog);
  app.put("/blog/setActive", requireAuth, Blog.setActive);
  app.delete("/blog/delete/:blog_id", requireAuth, Blog.deleteBlog);
  app.put("/blog/urls/:blog_id", requireAuth, Blog.setImageUrls);
  app.get("/blog/active", Blog.getActiveBlogs);
  app.get("/blog/all", requireAuth, Blog.getAllBlogs);
  app.get("/blog/:blog_id", Blog.getBlog);
  app.post(
    "/blog/image/upload",
    upload.single("image"),
    requireAuth,
    Blog.uploadImage
  );
};
