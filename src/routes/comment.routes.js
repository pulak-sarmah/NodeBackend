import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(varifyJWT);

router.route("/video-comments/:videoId").get(getVideoComments);
router.route("/addComment/:commentId").post(addComment);
router.route("/updateComment/:commentId").patch(updateComment);
router.route("/deleteComment/:commentId").delete(deleteComment);

export default router;
