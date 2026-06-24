import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import {
  getUser,
  loginUser,
  logoutUser,
  logoutAllSessions,
  registerUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/", checkAuth, getUser);

router.post("/logout", checkAuth, logoutUser);

router.post("/logout-all", checkAuth, logoutAllSessions);


export default router;
