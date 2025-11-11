import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("ERROR: MONGO_URI is missing in .env file");
      console.error("Please add MONGO_URI to your .env file");
      throw new Error("MONGO_URI is missing in .env");
    }

    // Connect to MongoDB with options
    await mongoose.connect(uri, {
      // Remove deprecated options, use default settings
    });

    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Full error:", err);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
