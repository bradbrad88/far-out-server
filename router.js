const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { requireUser, requireAdmin } = require("./services/authorization");
const Authentication = require("./controllers/authentication");
const Gallery = require("./controllers/gallery");
const Blog = require("./controllers/blog");
const Comment = require("./controllers/comments");

module.exports = app => {
  app.get("/gallery", Gallery.getGallery);
  app.get("/gallery/inactive", requireAdmin, Gallery.getInactive);
  app.get("/gallery/all", requireAdmin, Gallery.getAll);
  app.post("/gallery/delete", requireAdmin, Gallery.deleteImage);
  app.post(
    "/gallery/insert",
    requireAdmin,
    upload.single("image"),
    Gallery.addImage
  );
  app.post("/gallery/display", requireAdmin, Gallery.setDisplay);
  app.get("/auth", requireAdmin, Authentication.authenticated);
  app.post("/auth/google", Authentication.signin);
  app.post("/edit/blog", requireAdmin, Blog.newBlog);
  app.put("/edit/blog/", requireAdmin, Blog.editBlog);
  app.put("/blog/setActive", requireAdmin, Blog.setActive);
  app.delete("/blog/delete/:blog_id", requireAdmin, Blog.deleteBlog);
  app.put("/blog/urls/:blog_id", requireAdmin, Blog.setImageUrls);
  app.get("/blog/active", Blog.getActiveBlogs);
  app.get("/blog/all", requireAdmin, Blog.getAllBlogs);
  app.get("/blog/:blog_id", Blog.getBlog);
  app.post(
    "/blog/image/upload",
    upload.single("image"),
    requireAdmin,
    Blog.uploadImage
  );
  app.post("/comment/new", requireUser, Comment.newComment);
  app.get("/comment/image/:image_id", Comment.getComments);
  app.get("/comment/blog/:blog_id", Comment.getComments);
};
