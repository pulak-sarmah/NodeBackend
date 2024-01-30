import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = -1,
    query,
    userId,
  } = req.query;

  const skip = (page - 1) * limit;

  let matchStage = {};
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    matchStage.owner = userId;
  }

  if (query) {
    matchStage.title = { $regex: query, $options: "i" };
  }

  let sortStage = {};
  sortStage[sortBy] = parseInt(sortType);

  const pipeline = [
    { $match: matchStage },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        "owner.refreshToken": 0,
        "owner.otpExpires": 0,
        "owner.otp": 0,
        "owner.password": 0,
        "owner.accessToken": 0,
      },
    },
  ];

  const videos = await Video.aggregate(pipeline);

  if (!videos.length) throw new ApiError(404, "No videos found");

  const total = await Video.countDocuments(matchStage);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          total,
          page,
          totalPages,
          limit,
        },
      },
      "Videos found"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const localVideoPath = req.file;

  if (!localVideoPath) {
    throw new ApiError(400, "Video is required");
  }

  const uploadedVideo = await uploadOnCloudinary(localVideoPath);

  if (!uploadedVideo) {
    throw new ApiError(500, "Failed to upload video");
  }

  const video = await Video.create({
    title,
    description,
    videofile: uploadedVideo.url,
    thumbnail: uploadedVideo.thumbnail,
    owner: req.user._id,
    duration: uploadedVideo.videoLength,
  });

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
