import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/", checkAuth, getUser);

router.post("/logout", checkAuth, logoutUser);

export default router;
