import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import {
  getUser,
  loginUser,
  createSession,
  logoutUser,
  logoutAllSessions,
  registerUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/create-session", createSession);

router.get("/", checkAuth, getUser);

router.post("/logout", checkAuth, logoutUser);

router.post("/logout-all", checkAuth, logoutAllSessions);


export default router;
