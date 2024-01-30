import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";

import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
const router = Router();

router.use(varifyJWT);

router.route("/toggle-subscription/:channelId").get(toggleSubscription);
router
  .route("/get-user-channel-subscribers/:channelId")
  .get(getUserChannelSubscribers);
router.route("/get-subscribed-channels").get(getSubscribedChannels);

export default router;
