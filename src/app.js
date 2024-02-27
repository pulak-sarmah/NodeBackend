import cookieParser from "cookie-parser";
import cors from "cors";
import Express from "express";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import errorHandler from "./middlewares/errorHandler.js";
import swaggerSpec from "./utils/swagger.js";

const app = Express();

const clientUrls = process.env.CLIENT_URL.split(",");

app.use(
  cors({
    origin: clientUrls,
    credentials: true,
  })
);

app.use(Express.json({ limit: "32kb" }));

app.use(Express.urlencoded({ extended: true, limit: "32kb" }));

app.use(Express.static("public"));

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use(limiter);

//swagger route
app.use("/swaggerUI", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//route imports
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscribtionRouter from "./routes/subscribtion.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/videos.routes.js";

// routes declearation
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscribtionRouter);
app.use("/api/v1/tweets", tweetRouter);

app.use(errorHandler);

export { app };
