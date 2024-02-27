import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(400, "Please provide a name and description");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(
      new ApiResponse("success", playlist, "Successfully created playlist")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const playlists = await Playlist.find({ owner: userId }).populate({
    path: "owner",
    select: "_id username email",
  });

  res
    .status(200)
    .json(
      new ApiResponse("success", playlists, "Successfully retrieved playlists")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId).populate({
    path: "owner",
    select: "_id username email",
  });

  res
    .status(200)
    .json(
      new ApiResponse("success", playlist, "Successfully retrieved playlist")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  playlist.videos.push(videoId);

  await playlist.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(
        "success",
        playlist,
        "Successfully added video to playlist"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId) || !playlistId) {
    throw new ApiError(400, "invalid playlistId or playlistId not provided");
  }

  if (!isValidObjectId(videoId) || !videoId) {
    throw new ApiError(400, "invalid videoId or videoId not provided");
  }

  await Playlist.updateOne({ _id: playlistId }, { $pull: { videos: videoId } });
  res
    .status(200)
    .json(
      new ApiResponse("success", {}, "Successfully deleted video from playlist")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId) || !playlistId) {
    throw new ApiError(400, "invalid playlistId or playlistId not provided");
  }

  await Playlist.findByIdAndDelete(playlistId);

  res
    .status(200)
    .json(new ApiResponse("success", {}, "Successfully deleted playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId) || !playlistId) {
    throw new ApiError(400, "invalid playlistId or playlistId not provided");
  }

  if (!name || !description) {
    throw new ApiError(400, "Please provide a name and description");
  }

  if (name) {
    await Playlist.findOneAndUpdate(
      { _id: playlistId },
      { name: name },
      { new: true }
    );
  }

  if (description) {
    await Playlist.findOneAndUpdate(
      { _id: playlistId },
      { description: description },
      { new: true }
    );
  }

  const playlist = await Playlist.findById(playlistId);

  res
    .status(200)
    .json(
      new ApiResponse("success", playlist, "Successfully updated playlist")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
