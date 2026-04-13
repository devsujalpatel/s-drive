import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Directory from "../models/directory.model.js";

// Register
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  const session = await mongoose.startSession();
  try {
    const rootDirId = new ObjectId();
    const userId = new ObjectId();
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(409).json({
        error: "User already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }

    // Start Transactions

    await session.withTransaction(async () => {
      await Directory.insertOne(
        {
          _id: rootDirId,
          name: `root-${email}`,
          parentDirId: null,
          userId,
        },
        { session },
      );

      await User.insertOne(
        {
          _id: userId,
          name,
          email,
          password,
          rootDirId,
        },
        { session },
      );
    });

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    if (err.code === 121) {
      return res.status(400).json({
        error: "Invalid Fields, please check your input and try again.",
      });
    } else {
      next(err);
    }
  } finally {
    await session.endSession();
  }
};

// Login
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const userOid = user._id.toString();
    res.cookie("uid", userOid, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    res.json({ message: "user logged in successfully" });
  } catch (error) {
    next(error);
  }
};

// Get User
export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

// Logout
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("uid");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Logout Failed" });
    next(error);
  }
};
