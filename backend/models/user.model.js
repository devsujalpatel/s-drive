import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [64, "Name must not exceed 64 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [64, "Password must not exceed 64 characters"],
    },
    rootDirId: { type: Schema.Types.ObjectId, default: null, ref: "Directory" },
    picture: { type: String, default: 'https://placehold.net/avatar.png' },
    googleRefreshToken: {
        type: String,
    },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MANAGER", "USER"],
      default: "USER"
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {timestamps: true},
  { strict: "throw" },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

const User = model("User", userSchema);
export default User;
