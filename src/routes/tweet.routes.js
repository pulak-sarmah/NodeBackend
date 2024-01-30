import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
const router = Router();

router.use(varifyJWT);

router.route("/add-tweet").post(createTweet);

router.route("/get-all-tweets").get(getUserTweets);

router.route("/update-tweet/:id").patch(updateTweet);

router.route("/delete-tweet/:id").delete(deleteTweet);

export default router;
