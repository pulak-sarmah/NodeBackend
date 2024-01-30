import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
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

  const localVideoPath = req.files?.video?.[0]?.path;
  const localThumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (!localVideoPath || !localThumbnailPath) {
    throw new ApiError(400, "Video and thumbnail is required");
  }

  const [videofile, thumbnail] = await Promise.all([
    uploadOnCloudinary(localVideoPath),
    uploadOnCloudinary(localThumbnailPath),
  ]);

  if (!videofile || !thumbnail) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
  }

  const video = await Video.create({
    title,
    description,
    videofile: videofile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    duration: videofile.duration,
  });

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  const video = await Video.findById(videoId);

  res.status(200).json(new ApiResponse(200, video, "video found succesfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }
  const { title, description } = req.body;

  const localThumbnailPath = req.file?.path;

  if (!title && !description && !localThumbnailPath) {
    throw new ApiError(400, "Nothing to update");
  }

  if (title) {
    await Video.findByIdAndUpdate(videoId, { title });
  }

  if (description) {
    await Video.findByIdAndUpdate(videoId, { description });
  }

  if (localThumbnailPath) {
    const thumbnail = await uploadOnCloudinary(localThumbnailPath);
    await Video.findByIdAndUpdate(videoId, { thumbnail: thumbnail.url });
  }

  const updatedVideo = await Video.findById(videoId);

  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  await Video.findByIdAndDelete(videoId);

  res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not owner of this video");
  }

  video.isPublished = !video.isPublished;

  const updatedVideo = await video.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: updatedVideo.isPublished },
        "Video publish status updated successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
