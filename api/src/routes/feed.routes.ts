import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { postMediaUpload } from "../middleware/upload.middleware";
import {
  createPost,
  getFeedPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
  getUserPosts,
} from "../controllers/feed.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Post CRUD
router.post("/posts", postMediaUpload, createPost);
router.get("/posts", getFeedPosts);
router.get("/posts/:postId", getPost);
router.put("/posts/:postId", updatePost);
router.delete("/posts/:postId", deletePost);

// Like system
router.post("/posts/:postId/like", toggleLike);

// Comments
router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", addComment);
router.delete("/comments/:commentId", deleteComment);

// User posts
router.get("/users/:userId/posts", getUserPosts);

export default router;
