import express from "express";
import { checkAuth, checkDeleted } from "../middlewares/auth.middleware.js";
import {
  getUser,
  // loginUser,
  // createSession,
  logoutUser,
  logoutAllSessions,
  // registerUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// router.post("/register", registerUser);

// router.post("/login", loginUser);

// router.post("/create-session", createSession);

router.get("/", checkAuth, checkDeleted, getUser);

router.post("/logout", checkAuth, checkDeleted, logoutUser);

router.post("/logout-all", checkAuth, checkDeleted, logoutAllSessions);


export default router;
