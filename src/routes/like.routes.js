import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
const router = Router();

router.use(varifyJWT);

router.route("/toggle-comment-like/:commentId").post(toggleCommentLike);
router.route("/toggle-tweet-like/:tweetId").post(toggleTweetLike);
router.route("/toggle-video-like/:videoId").post(toggleVideoLike);
router.route("/liked-videos").get(getLikedVideos);

export default router;
