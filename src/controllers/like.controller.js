import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user._id;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  let like = await Like.findOne({ video: videoId, likedBy: userId });

  if (like) {
    await Like.findByIdAndRemove(like._id);
  } else {
    like = new Like({ video: videoId, likedBy: userId });
    await like.save();
  }

  res
    .status(200)
    .json(new ApiResponse("success", {}, "Successfully toggle liked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid commentId");
  }

  let like = await Like.findOne({ comment: commentId, likedBy: userId });

  if (like) {
    await Like.findByIdAndRemove(like._id);
  } else {
    like = new Like({ comment: commentId, likedBy: userId });
    await like.save({});
  }

  res
    .status(200)
    .json(new ApiResponse("success", {}, "Successfully toggle liked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweetId");
  }

  let like = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (like) {
    await Like.findByIdAndRemove(like._id);
  } else {
    like = new Like({ tweet: tweetId, likedBy: userId });
    await like.save({ validateBeforeSave: false });
  }

  res
    .status(200)
    .json(new ApiResponse("success", {}, "Successfully toggle liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likes = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  }).populate("video");

  const likedVideos = likes.map((like) => like.video);

  res.status(200).json(new ApiResponse("success", { likedVideos }));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
