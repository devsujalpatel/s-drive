import { createClient, SCHEMA_FIELD_TYPE as SchemaFieldTypes } from "redis";

const redisClient = await createClient({
  url: process.env.REDIS_URL,
})
  .on("error", (err) => console.log("Redis Client Error", err))
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
      PREFIX: "user:",
    },
  );
} catch (err) {
  if (!err.message.includes("Index already exists")) {
    throw err;
  }
}

export { redisClient };
