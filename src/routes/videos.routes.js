import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  updateVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use(varifyJWT);

router.route("/").get(getAllVideos);
router.route("/publish-video").post(
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);

router.route("/:videoId").get(getVideoById);

router.route("/update-video/:videoId").patch(updateVideo);

router.route("/delete-video/:videoId").delete(deleteVideo);

router.route("/toggle-publish-status/:videoId").patch(togglePublishStatus);

export default router;
