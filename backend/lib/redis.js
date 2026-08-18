import { createClient, SCHEMA_FIELD_TYPE as SchemaFieldTypes } from "redis";

const redisClient = await createClient({
  url: process.env.REDIS_URL,
})
  .on("error", (err) => {
    console.error("Redis Client Error:", err);
  })
  .connect();

try {
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
  if (!err.message.includes("Index already exists")) {
    throw err;
  }
}

export { redisClient };
