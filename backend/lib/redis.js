import { createClient, SCHEMA_FIELD_TYPE as SchemaFieldTypes } from "redis";

const redisClient = await createClient({
  url: process.env.REDIS_URL,
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

try {
  console.log(" Creating userIdIdx...");

  await redisClient.ft.create(
    "userIdIdx",
    {
      "$.userId": {
        type: SchemaFieldTypes.TAG,
        AS: "userId",
      },
    },
    {
      ON: "JSON",
      PREFIX: "session:",
    },
  );

  console.log("✅ userIdIdx created");
} catch (err) {
  console.log("❌ ft.create threw:", err);

  if (!err.message.includes("Index already exists")) {
    throw err;
  }

  console.log("⚠️ userIdIdx already exists");
}

console.log("🔥 Redis initialization finished");

export { redisClient };
