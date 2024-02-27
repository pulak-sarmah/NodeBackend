import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }
};

//register controller
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  if (!fullname || !username || !email || !password) {
    throw new ApiError(400, "All Fields are required");
  }
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new ApiError(403, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }

    let uploadPromises = [uploadOnCloudinary(avatarLocalPath)];

    if (coverImageLocalPath) {
      uploadPromises.push(uploadOnCloudinary(coverImageLocalPath));
    }

    const uploadResults = await Promise.all(uploadPromises);

    let avatar, coverImage;
    if (uploadResults.length === 2) {
      [avatar, coverImage] = uploadResults;
    } else {
      [avatar] = uploadResults;
    }
    if (!avatar) {
      throw new ApiError(500, "Avatar upload failed");
    }

    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken -otp -otpExpires"
    );

    if (!createdUser) {
      throw new ApiError(500, "User not created");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
});

//login controller
const loginUser = asyncHandler(async (req, res) => {
  //get email and password from req.body
  //validate email and password
  //check if the user exists
  //check if password and email is correct
  //generate refresh and access token and save refresh token in db
  // send it to cookie
  //return response

  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordVaild = await user.isPasswordCorrect(password);

  if (!isPasswordVaild) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -otp -otpExpires"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

//logout controller
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: "" },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

//refresh token controller
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token found");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//change password controller
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  user.password = newPassword;

  await user.save({
    validateBeforeSave: false,
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

//get user profile controller
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Not authenticated");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "userData fetched successfully"));
});

//update account details controller
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullname } = req.body;

  if (!fullname && !email) {
    throw new ApiError(400, "fullname or email is required");
  }

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken -otp -otpExpires"
  );

  if (!user) {
    throw new ApiError(401, "Not authenticated");
  }

  if (email) {
    user.email = email;
  }
  if (fullname) {
    user.fullname = fullname;
  }

  await user.save({
    validateBeforeSave: false,
  });

  res.status(200).json(new ApiResponse(200, user, "Account updated"));
});

//update avatar controller
const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "No avatar found");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken -otp -otpExpires");

  res.status(200).json(new ApiResponse(200, user, "Avatar updated"));
});

//update cover image controller
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "No coverImage found");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage) {
    throw new ApiError(400, "coverImage upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken -otp -otpExpires");

  res.status(200).json(new ApiResponse(200, user, "coverImage updated"));
});

//request update password controller
const requestUpdatePassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = crypto.randomBytes(4).toString("hex");

  user.otp = otp;

  // Set otpExpires to 15 minutes from now
  user.otpExpires = Date.now() + 15 * 60 * 1000;

  await user.save();

  const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USERNAME,
    subject: "OTP to reset password",
    html: `
    <h1>OTP for Account Update</h1>
    <p>Hello,</p>
    <p>Your OTP for account update is <strong>${otp}</strong>.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best,</p>
    <p>Pulak Sarmah</p>
`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json(new ApiResponse(200, null, "OTP sent"));
});

//update forgot password controller
const updateForgotPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  if (!otp || !newPassword) {
    throw new ApiError(400, "otp and newPassword is required");
  }

  const user = await User.findOne({ otp });

  if (!user) {
    throw new ApiError(401, "Invalid OTP");
  }

  if (user.otpExpires < Date.now()) {
    throw new ApiError(401, "OTP has expired");
  }

  user.password = newPassword;
  user.otp = null;

  await user.save({
    validateBeforeSave: false,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user?._id
  );

  const newUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, { user: newUser }, "Password updated successfully")
    );
});

// get user channel profile

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeTo",
      },
    },

    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribeTo",
        },

        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "user channel fetched successfully")
    );
});

// get users watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $arrayElemAt: ["$owner", 0],
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUserProfile,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  requestUpdatePassword,
  updateForgotPassword,
  getUserChannelProfile,
  getWatchHistory,
};
