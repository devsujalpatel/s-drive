import { createClient, SCHEMA_FIELD_TYPE as SchemaFieldTypes } from "redis";

const redisClient = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

await redisClient.ft.create(
  "userIdIdx",
  {
    "$.userId": { type: SchemaFieldTypes.TAG, AS: "userId" },
  },
  {
    ON: "JSON",
    PREFIX: "user:",
  },
);

export { redisClient };
