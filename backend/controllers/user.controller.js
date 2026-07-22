// import mongoose from "mongoose";
// import User from "../models/user.model.js";
// import Directory from "../models/directory.model.js";
import { deleteSessionService } from "../services/sessionService.js";
// import OTP from "../models/otpModel.js";
// import { sendOtpService } from "../services/sendOtpService.js";
// import { createUserSessionService } from "../services/sessionService.js";

// Register
// export const registerUser = async (req, res, next) => {
//   const { name, email, password, otp } = req.body;
  
//   if (!name || !email || !password) {
//     return res.status(400).json({ error: "All fields are required" });
//   }


//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     return res.status(400).json({ error: "User already exists" });
//   }
//   if(existingUser.deleted) {
//     return res.status(400).json({ error: "Your account has been deleted. Please contact support if you need assistance." });
//   }
  
//   if (password.length < 6) {
//     return res
//       .status(400)
//       .json({ error: "Password must be at least 6 characters long" });
//   }

//   const otpRecord = await OTP.findOne({ email, otp });
//   if (!otpRecord) {
//     res.status(400).json({ error: "Invalid or Expired OTP" });
//   }
//   await otpRecord.deleteOne();

//   const session = await mongoose.startSession();
//   try {
//     const rootDirId = new mongoose.Types.ObjectId();
//     const userId = new mongoose.Types.ObjectId();

//     await session.withTransaction(async () => {
//       await Directory.insertOne(
//         {
//           _id: rootDirId,
//           name: `root-${email}`,
//           parentDirId: null,
//           userId,
//         },
//         { session },
//       );
//       await User.insertOne(
//         {
//           _id: userId,
//           name,
//           email,
//           password,
//           rootDirId,
//         },
//         { session },
//       );
//     });

//     res.status(201).json({ message: "User Registered" });
//   } catch (err) {
//     if (err.code === 11000 && err.keyValue.email) {
//       return res.status(409).json({
//         error: "This email is already exists",
//         message:
//           "A user with this email address already exists. Please try logging in or use a different email.",
//       });
//     }
//     if (err.code === 121) {
//       return res.status(400).json({
//         error: "Invalid Fields, please check your input and try again.",
//       });
//     }
//     next(err);
//   } finally {
//     await session.endSession();
//   }
// };

// Login
// export const loginUser = async (req, res, next) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     if (user.isDeleted) {
//       return res.status(401).json({ error: "Your account has been deleted. Please contact support if you need assistance." });
//     }
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: "Invalid Credentials" });
//     }
//     const { success } = await sendOtpService(email);
//     if (!success) {
//       return res.status(500).json({ error: "Failed to send OTP" });
//     }
//     res.status(200).json({ message: "OTP sent successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

// Create Session
// export const createSession = async (req, res, next) => {
//   const { email, otp } = req.body;
//   try {
//     const otpRecord = await OTP.findOne({ email, otp });
//     if (!otpRecord) {
//       return res.status(500).json({ error: "Invalid or expired OTP" });
//     }

//     const user = await User.findOne({ email: otpRecord.email });
//     if (!user) {
//       return res.status(500).json({ error: "User not found" });
//     }

//     const sessionId = crypto.randomUUID();
//     const res = await createUserSessionService(user._id, sessionId);
//     if (!res){
//       return res.status(500).json({ error: "Failed to create session" });
//     }
    
//     res.cookie("sid", sessionId, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       signed: true,
//       maxAge: 60 * 1000 * 60 * 24 * 7,
//     });
//     res.status(200).json({ message: "user logged in successfully" });
//   } catch (error) {
//     next(error);
//   }
// };

// Get User
export const getUser = (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    profile: req.user.picture,
    role: req.user.role,
  });
};

// Logout
export const logoutUser = async (req, res, next) => {
  try {
    const sessionId = req.session.id;
    await deleteSessionService(sessionId);
    res.clearCookie("sid");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Logout Failed" });
    next(error);
  }
};

export const logoutAllSessions = async (req, res, next) => {
  try {
    res.clearCookie("sid");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
