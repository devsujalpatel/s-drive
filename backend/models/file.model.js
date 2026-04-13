import { model, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    extension: { type: String, required: true },
    name: { type: String, required: true },
    parentDirId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Directory",
    },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { strict: "throw" },
);

const File = model("File", fileSchema);
export default File;
