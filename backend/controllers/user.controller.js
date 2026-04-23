import mongoose from "mongoose";
import User from "../models/user.model.js";
import Directory from "../models/directory.model.js";
import crypto from "crypto";
import { verifyPassword, hashPassword } from "../utils/hash-password.js";

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

    const { salt, hashedPassword } = await hashPassword(password);

    if (!salt || !hashedPassword) {
      return res.status(500).json({ error: "Password hashing failed" });
    }

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
          salt,
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

    const isMatch = await verifyPassword({
      password,
      hashedPassword: user.password,
      salt: user.salt,
    });
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const userOid = user._id.toString();

    const cookiePayload = JSON.stringify({
      id: userOid,
      expiry: Math.round(Date.now() / 1000) + 100000, // 1 day expiry
    });

    res.cookie("token", Buffer.from(cookiePayload).toString("base64url"), {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 1000 * 60 * 24,
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
    res.clearCookie("token");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Logout Failed" });
    next(error);
  }
};
