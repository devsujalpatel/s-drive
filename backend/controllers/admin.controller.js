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