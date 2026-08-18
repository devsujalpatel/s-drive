import mongoose from "mongoose";

export default function isValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  } else {
    return true;
  }
}
