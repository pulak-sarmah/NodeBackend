import { Router } from "express";
import { varifyJWT } from "../middlewares/auth.middleware.js";

import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
const router = Router();

router.use(varifyJWT);

router.route("/toggle/:channelId").get(toggleSubscription);
router.route("/get-subscribers/:channelId").get(getUserChannelSubscribers);
router.route("/:subscriberId/channels").get(getSubscribedChannels);

export default router;
