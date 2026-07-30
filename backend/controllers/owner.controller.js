import { rm } from "fs/promises";
import Directory from "../models/directory.model.js";
import File from "../models/file.model.js";
import User from "../models/user.model.js";
import { deleteSessionServiceByUserId } from "../services/sessionService.js";

export const deleteUserHard = async (req, res, next) => {
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

    const files = await File.find({ userId });
    if (!files) {
      return res.status(404).json({ error: "Files not found!" });
    }

    await Promise.all(
      files.map(async (file) => {
        await rm(`./storage/${file._id}${file.extension}`, { recursive: true });
      }),
    );

    await Promise.all([
      File.deleteMany({ userId }),
      Directory.deleteMany({ userId }),
      deleteSessionServiceByUserId(userId),
      User.findByIdAndDelete(userId),
    ]);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const recoverUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    user.isDeleted = false;
    await user.save();
    return res.status(200).json({
      message: "User recovered successfully",
    });
  } catch (error) {
    next(error);
  }
};
