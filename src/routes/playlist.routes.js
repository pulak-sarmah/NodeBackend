import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(varifyJWT);

router.route("/").post(createPlaylist);
router.route("/{userId}").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId/videos/:videoId").post(addVideoToPlaylist);

router
  .route("/remove/:playlistId/videos/:videoId")
  .delete(removeVideoFromPlaylist);

router.route("/delete/:playlistId").delete(deletePlaylist);

router.route("update/:playlistId").patch(updatePlaylist);

export default router;
