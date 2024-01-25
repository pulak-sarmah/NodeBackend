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

// routes declearation
app.use("/api/v1/users", userRouter);

export { app };
