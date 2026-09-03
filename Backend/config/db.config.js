import mongoose from "mongoose";

const MAX_RETRIES = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`,
        error.message
      );
      if (attempt === MAX_RETRIES) {
        console.error("Giving up on MongoDB connection after all retries.");
        process.exit(1);
      }
      // Backoff: 5s, 10s, 15s, 20s between attempts
      await sleep(attempt * 5000);
    }
  }
};

export default connectDB;
