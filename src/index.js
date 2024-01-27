import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("Error running server");
    });
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("Error:", error.message);
    process.exit(1);
  });
