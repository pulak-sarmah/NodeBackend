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

router.route("/add").post(createTweet);

router.route("/get").get(getUserTweets);

router.route("/update/:tweetId").patch(updateTweet);

router.route("/delete/:id").delete(deleteTweet);

export default router;
