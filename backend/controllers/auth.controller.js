import Directory from "../models/directory.model.js";
import OTP from "../models/otpModel.js";
import User from "../models/user.model.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import { sendOtpService } from "../services/sendOtpService.js";
import mongoose from "mongoose";
import { createUserSessionService } from "../services/sessionService.js";
import { oauth2Client } from "../lib/google.js";

export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resData = await sendOtpService(email);
    res.status(201).json(resData);
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      res.status(400).json({ error: "Invalid or Expired OTP" });
    }
    res.json({ message: "OTP Verified!" });
  } catch (err) {
    next(err);
  }
};

export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;
  const session = await mongoose.startSession();
  try {
    const userData = await verifyIdToken(idToken);
    if (!userData) {
      return res.status(400).json({ error: "Invalid ID token" });
    }

    const { name, email, picture } = userData;
    const user = await User.findOne({ email });
    if (user) {
      if (user.isDeleted) {
        return res.status(403).json({ error: "Your account has been deleted. Contact support to restore your account." });
      }
      const sessionId = crypto.randomUUID();
       await createUserSessionService(user._id, sessionId);
      if (user.picture.includes("https://placehold.net/avatar.png")) {
        user.picture = picture;
        await user.save();
      }
      res.cookie("sid", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        signed: true,
        maxAge: 60 * 1000 * 60 * 24 * 7,
      });
      return res.status(200).json({ message: "user logged in successfully" });
    }
    const rootDirId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

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

      const newUser = await User.insertOne(
        { _id: userId, email, name, picture, rootDirId, picture },
        { session },
      );
      const sessionId = crypto.randomUUID();
      const response = await createUserSessionService(newUser._id, sessionId);
      if (!response) {
        return res.status(500).json({ error: "failed to create session" });
      }

      res.cookie("sid", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        signed: true,
        maxAge: 60 * 1000 * 60 * 24 * 7,
      });
      res.status(200).json({ message: "user logged in successfully" });
    });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

export const connectGoogleDrive = async (req, res, next) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/drive.readonly"],
      state: "drive",
    });
    res.redirect(url);
  } catch (err) {
    next(err);
  }
};

export const googleDriveCallback = async (req, res, next) => {
  try {
    if (req.query.state !== "drive") {
      return res.redirect(process.env.CLIENT_URL);
    }

    const { tokens } = await oauth2Client.getToken(req.query.code);

    await User.findByIdAndUpdate(req.user._id, {
      googleRefreshToken: tokens.refresh_token,
    });

    return res.redirect(`${process.env.CLIENT_URL}/settings?drive=connected`);
  } catch (err) {
    next(err);
  }
};
