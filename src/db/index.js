import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`Connected to DB!! ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.log("Error:", error.message);
    throw new Error("Error connecting to DB");
  }
};

export default connectDB;
