import "dotenv/config";
import mongoose from "mongoose";

export async function connectDB() {
  try {
    console.log("Trying to connect...");
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("MongoDB failed ❌:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed gracefully");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
};


process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed gracefully");
  process.exit(0);
});
