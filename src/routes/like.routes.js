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

router.route("/comment/:commentId").post(toggleCommentLike);
router.route("/tweet/:tweetId").post(toggleTweetLike);
router.route("/video/:videoId").post(toggleVideoLike);
router.route("/videos").get(getLikedVideos);

export default router;
