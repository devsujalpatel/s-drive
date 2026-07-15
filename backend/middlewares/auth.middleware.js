import Session from "../models/session.model.js";
import User from "../models/user.model.js";

export async function checkAuth(req, res, next) {
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
  req.session = session;
  next();
}

export async function checkAdmin(req, res, next) {
  const { user } = req;
  if (user.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function checkManager(req, res, next) {
  const { user } = req;
  if (user.role !== "MANAGER") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function checkDeleted(req, res, next) {
  const { user } = req;
  if (user.isDeleted) {
    return res.status(401).json({ error: "Your account has been deleted. Please contact support if you need assistance." });
  }
  next();
}