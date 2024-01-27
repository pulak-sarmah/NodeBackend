import { Router } from "express";
import {
  changeCurrentPassword,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  requestUpdatePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  updateForgotPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

import { varifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/reset-password").post(requestUpdatePassword);
router.route("/reset-password-verify").post(updateForgotPassword);

//secured routes
router.route("/logout").post(varifyJWT, logoutUser);
router.route("/change-password").post(varifyJWT, changeCurrentPassword);
router.route("/user-data").get(varifyJWT, getUserProfile);
router.route("/update-profile").patch(varifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(varifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/update-cover-image")
  .patch(varifyJWT, upload.single("coverImage"), updateCoverImage);

export default router;
