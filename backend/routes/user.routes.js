import express from "express";
import { checkAuth, checkDeleted } from "../middlewares/auth.middleware.js";
import {
  getUser,
  logoutUser,
  logoutAllSessions,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", checkAuth, checkDeleted, getUser);

router.post("/logout", checkAuth, checkDeleted, logoutUser);

router.post("/logout-all", checkAuth, checkDeleted, logoutAllSessions);

export default router;
