import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Please provide a video id");
  }

  const { page = 1, limit = 10 } = req.query;
  const comments = await Comment.find({ video: videoId })
    .populate("video", "_id title description")
    .populate("owner", "_id name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await Comment.countDocuments({ video: videoId });
  const totalPages = Math.ceil(total / limit);
  const currentPage = page * 1;
  const nextPage = currentPage + 1;
  const prevPage = currentPage - 1;
  const hasNextPage = nextPage <= totalPages;
  const hasPrevPage = prevPage >= 1;
  const pagination = {
    totalPages,
    currentPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  };
  res
    .status(200)
    .json(
      new ApiResponse(
        "success",
        { comments, pagination },
        "Successfully fetched comments"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { text } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Please provide a video id");
  }

  if (!text) {
    throw new ApiError(400, "Please provide a comment text");
  }

  const comment = await Comment.create({
    text,
    user: req.user._id,
    video: videoId,
  });
  await comment
    .populate("owner", "_id name email")
    .populate("video", "_id title description")
    .execPopulate();
  res
    .status(201)
    .json(
      new ApiResponse("success", { comment }, "Successfully created comment")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { text } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Please provide a comment id");
  }

  if (!text) {
    throw new ApiError(400, "Please provide a comment text");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { text },
    { new: true }
  );
  await comment
    .populate("owner", "_id name email")
    .populate("video", "_id title description")
    .execPopulate();
  res
    .status(200)
    .json(
      new ApiResponse("success", { comment }, "Successfully updated comment")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Please provide a comment id");
  }

  await Comment.findByIdAndDelete(commentId);
  res
    .status(200)
    .json(new ApiResponse("success", null, "Successfully deleted comment"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
