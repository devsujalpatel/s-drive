import Session from "../models/session.model.js";
import User from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const [users, sessions] = await Promise.all([
      User.find().select("_id name email role isDeleted").lean(),
      Session.find().select("userId").lean(),
    ]);

    const loggedInUsers = new Set(
      sessions.map((session) => session.userId.toString()),
    );
    const usersWithStatus = users.map(({ _id, name, email, role, isDeleted }) => ({
      id: _id,
      name,
      email,
      role,
      isDeleted,
      isLoggedIn: loggedInUsers.has(_id.toString()),
    }));

    return res.status(200).json(usersWithStatus);
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

    if (req.user.role === "MANAGER" && user.role === "ADMIN") {
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

    if (userId === req.user.id.toString()) {
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
    if (req.user.role === "MANAGER" && user.role === "ADMIN") {
      return res.status(403).json({
        message: "Managers cannot delete admins",
      });
    }

    if (req.user.role === "ADMIN" && user.role === "OWNER") {
      return res.status(403).json({
        message: "Admins cannot delete owners",
      });
    }

    await Promise.all([
      Session.deleteMany({ userId }),
      User.findByIdAndUpdate(userId, { isDeleted: true }),
    ]);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

