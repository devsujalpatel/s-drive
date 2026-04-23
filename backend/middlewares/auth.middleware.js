import User from "../models/user.model.js";

export default async function checkAuth(req, res, next) {
  const { token } = req.signedCookies;

  if (!token) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged!" });
  }

  const { id: uid, expiry } = JSON.parse(
    Buffer.from(token, "base64url").toString(),
  );

  const currentTime = Math.round(Date.now() / 1000);

  if (currentTime > expiry) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Token expired" });
  }

  const user = await User.findOne({ _id: String(uid) });
  if (!user) {
    return res.status(401).json({ error: "Not Logged In" });
  }
  req.user = user;
  next();
}
