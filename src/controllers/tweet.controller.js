import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) throw new ApiError(400, "Content is required");

    const owner = req.user?._id;

    if (!owner) throw new ApiError(400, "User not found");

    const tweet = await Tweet.create({ content, owner });

    res.status(201).json(new ApiResponse(201, { tweet }, "Tweet created"));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  if (!userId) throw new ApiError(400, "Invalid userId");

  const tweets = await Tweet.find({ owner: userId }).populate({
    path: "owner",
    select: "_id name email",
  });

  if (!tweets) throw new ApiError(404, "No tweets found");

  res.status(200).json(new ApiResponse(200, tweets, "Tweets found"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const { content } = req.body;

  if (!tweetId) throw new ApiError(400, "Invalid tweetId");
  if (!content || (content.trim() === "" && content.length < 1))
    throw new ApiError(400, "Content is required or it's too short");

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId },
    { content },
    { new: true }
  );

  if (!updatedTweet) throw new ApiError(404, "Tweet not found");

  res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  if (!tweetId) throw new ApiError(400, "Invalid tweetId");

  const deletedTweet = await Tweet.findOneAndDelete({ _id: tweetId });

  if (!deletedTweet) throw new ApiError(404, "Tweet not found");

  res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
