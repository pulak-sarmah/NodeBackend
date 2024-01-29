import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments } from "../controllers/comment.controller.js";

const router = Router();

router.route("video-comments/:videoId").get(varifyJWT, getVideoComments);

export default router;
