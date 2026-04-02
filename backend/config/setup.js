import { connectDB } from "./db";

const db = await connectDB();

db.command({
  create: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "name", "email", "password", "rootDirId"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        name: {
          bsonType: "string",
          minLength: 3,
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
        },
        password: {
          bsonType: "string",
          minLength: 4,
        },
        rootDirId: {
          bsonType: "objectId",
        },
      },
      additionalProperties: false,
    },
  },
});
