import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishAVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use(varifyJWT);

router.route("/get-all-videos").get(getAllVideos);
router.route("/publish-video").post(
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

export default router;
