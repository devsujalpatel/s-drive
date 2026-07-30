import { deleteSessionService, deleteSessionServiceByUserId } from "../services/sessionService.js"

// Get User
export const getUser = (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    profile: req.user.picture,
    role: req.user.role,
  });
};

// Logout
export const logoutUser = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    await deleteSessionService(userId);
    res.clearCookie("sid");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Logout Failed" });
    next(error);
  }
};

export const logoutAllSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await deleteSessionServiceByUserId(userId);
    res.clearCookie("sid");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
