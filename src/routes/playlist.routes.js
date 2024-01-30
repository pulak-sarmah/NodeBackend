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

router.route("/createPlaylist").post(createPlaylist);
router.route("/getUserPlaylists").get(getUserPlaylists);
router.route("/getPlaylistById/:playlistId").get(getPlaylistById);
router
  .route("/addVideoToPlaylist/:playlistId/:videoId")
  .post(addVideoToPlaylist);

router
  .route("/removeVideoFromPlaylist/:playlistId/:videoId")
  .delete(removeVideoFromPlaylist);

router.route("/deletePlaylist/:playlistId").delete(deletePlaylist);

router.route("/updatePlaylist/:playlistId").patch(updatePlaylist);

export default router;
