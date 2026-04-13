import { ObjectId } from "mongodb";
import User from "../models/user.model.js";

export default async function checkAuth(req, res, next) {
  const { uid } = req.cookies;
  if (!uid) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await User.findOne({ _id: new ObjectId(String(uid)) });
  if (!user) {
    return res.status(401).json({ error: "Not Logged In" });
  }
  req.user = user;
  next();
}
