import { redisClient } from "../lib/redis.js";
import User from "../models/user.model.js";
import { deleteSessionServiceByUserId } from "../services/sessionService.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      req.user.role === "OWNER" ? {} : { isDeleted: false },
    )
      .select("_id name email role isDeleted")
      .lean();

    const searchResult = await redisClient.ft.search("userIdIdx", "*");

    const loggedInUsers = new Set(
      searchResult.documents.map((doc) => doc.value.userId),
    );

    const usersWithStatus = users.map(
      ({ _id, name, email, role, isDeleted }) => ({
        id: _id,
        name,
        email,
        role,
        isDeleted,
        isLoggedIn: loggedInUsers.has(_id.toString()),
      }),
    );

    return res.status(200).json(usersWithStatus);
  } catch (error) {
    next(error);
  }
};

export const logoutById = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!isValidId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

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

    for (const session of loggedInUsers) {
      if (session.userId === userId) {
        await deleteSessionServiceByUserId(session.userId);
      }
    }

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

    if (!isValidId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

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
      deleteSessionServiceByUserId(userId),
      User.findByIdAndUpdate(userId, { isDeleted: true }),
    ]);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
