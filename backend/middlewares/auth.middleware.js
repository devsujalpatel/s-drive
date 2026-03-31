import { ObjectId } from "mongodb";

export default async function checkAuth(req, res, next) {
  const { uid } = req.cookies;
  const db = req.db;
  const userCollection = db.collection("users");
  if (!uid) {
    return res.status(401).json({ error: "Not logged!" });
  }
  const user = await userCollection.findOne({ _id: new ObjectId(String(uid)) });
  if (!user) {
    return res.status(401).json({ error: "Not Logged In" });
  }
  req.user = user;
  next();
}
