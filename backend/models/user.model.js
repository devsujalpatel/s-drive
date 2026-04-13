import { model, Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rootDirId: { type: Schema.Types.ObjectId, default: null, ref: "Directory" },
});

const User = model("User", userSchema);
export default User;
