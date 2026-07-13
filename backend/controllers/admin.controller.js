import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";
import Session from "../models/session.model.js";
import User from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const [users, sessions] = await Promise.all([
      User.find().select("_id name email role").lean(),
      Session.find().select("userId").lean(),
    ]);

    const loggedInUsers = new Set(
      sessions.map((session) => session.userId.toString()),
    );

    return res.status(200).json(
      users.map(({ _id, name, email, role }) => ({
        id: _id,
        name,
        email,
        role,
        isLoggedIn: loggedInUsers.has(_id.toString()),
      })),
    );
  } catch (error) {
    next(error);
  }
};

export const logoutById = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({
        message: "Cannot logout yourself",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (req.user.role === "manager" && user.role === "admin") {
      return res.status(403).json({
        message: "Managers cannot logout admins",
      });
    }

    await Session.deleteMany({ userId });

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({
        message: "Cannot delete yourself",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Optional: if managers can reach this endpoint
    if (req.user.role === "manager" && user.role === "admin") {
      return res.status(403).json({
        message: "Managers cannot delete admins",
      });
    }

    await Promise.all([
      User.findByIdAndDelete(userId),
      Session.deleteMany({ userId }),
      File.deleteMany({ userId }),
      Directory.deleteMany({ userId }),
    ]);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
