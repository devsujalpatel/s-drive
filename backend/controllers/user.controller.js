import mongoose from "mongoose";
import User from "../models/user.model.js";
import Directory from "../models/directory.model.js";
import bcrypt from "bcrypt";
import Session from "../models/session.model.js";

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
    const rootDirId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const hashedPassword = await bcrypt.hash(password, 12);

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
          password: hashedPassword,
          rootDirId,
        },
        { session },
      );
    });

    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    if (err.code === 11000 && err.keyValue.email) {
      return res.status(409).json({
        error: "This email is already exists",
        message:
          "A user with this email address already exists. Please try logging in or use a different email.",
      });
    }
    if (err.code === 121) {
      return res.status(400).json({
        error: "Invalid Fields, please check your input and try again.",
      });
    }
    next(err);
  } finally {
    await session.endSession();
  }
};

// Login
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const session = await Session.create({ userId: user._id });

    res.cookie("sid", session._id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });
    res.status(200).json({ message: "user logged in successfully" });
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
    res.clearCookie("token");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Logout Failed" });
    next(error);
  }
};
