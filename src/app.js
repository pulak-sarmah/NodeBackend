import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = Express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(Express.json({ limit: "32kb" }));

app.use(Express.urlencoded({ extended: true, limit: "32kb" }));

app.use(Express.static("public"));

app.use(cookieParser());

//route imports
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.route.js";
import playlistRouter from "./routes/playlist.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import subscribtionRouter from "./routes/subscribtion.route.js";
import tweetRouter from "./routes/tweet.route.js";

// routes declearation
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/subscribtion", subscribtionRouter);
app.use("/app/v1/tweets", tweetRouter);

export { app };
