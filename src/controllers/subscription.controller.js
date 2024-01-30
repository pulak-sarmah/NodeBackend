import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  // TODO: toggle subscription

  // 1. check if channel exists
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  // 2. check if user is already subscribed to channel

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  if (subscription) {
    // 3. if yes, then unsubscribe
    await subscription.remove();
    res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed from channel"));
  } else {
    // 4. if no, then subscribe
    const newSubscription = new Subscription({
      channel: channelId,
      subscriber: userId,
    });
    await newSubscription.save();
    res.status(200).json(new ApiResponse(200, null, "Subscribed to channel"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // 1. check if channel exists
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Find all subscriptions where the channel field is equal to channelId
  const subscriptions = await Subscription.find({
    channel: channelId,
  }).populate("subscriber");

  // 2. return subscribers
  res.status(200).json(new ApiResponse(200, subscriptions, "Subscribers"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // Check if subscriberId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, "Invalid subscriberId");
  }

  // Find all subscriptions where the subscriber field is equal to subscriberId
  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel");

  // Return the list of subscribed channels
  res.status(200).json(subscriptions);
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
