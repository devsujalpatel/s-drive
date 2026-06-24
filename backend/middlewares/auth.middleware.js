import Session from "../models/session.model.js";
import User from "../models/user.model.js";

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;

  if (!sid) {
    res.clearCookie("sid");
    return res.status(401).json({ error: "Not logged!" });
  }


  const session= await Session.findById(sid);
  if (!session) {
    return res.status(401).json({ error: "Session not found" });
  }

  const user = await User.findOne({ _id: session.userId });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }
  req.user = user;
  next();
}
