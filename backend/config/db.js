import { MongoClient } from "mongodb";

export const client = new MongoClient("mongodb://localhost:27017/sdrive");

export async function connectDB() {
  try {
    console.log("Trying to connect...");
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db();
  } catch (error) {
    console.error("MongoDB failed ❌:", error.message);
    await client.close();
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed gracefully");
  process.exit(0);
});
