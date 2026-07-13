import { Router } from "express";
import { getAllUsers } from "../controllers/admin.controller.js";
import checkAuth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", checkAuth, getAllUsers);

export default router;