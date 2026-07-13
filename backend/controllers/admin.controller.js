import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find().select("_id name email").lean();
    const allSessions = await Session.find().lean();
    const allSessionsUserId = allSessions.map((session) => session.userId.toString());
    const allSessionsUserIdSet = new Set(allSessionsUserId);
    const transformedUser = allUsers.map(({_id, name, email}) => ({id: _id, name, email, isLoggedIn: allSessionsUserIdSet.has(_id.toString())}))
    return res.status(200).json(transformedUser);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    await Session.deleteMany({ userId: userId });
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    await Session.deleteMany({ userId })
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}