import { Router } from "express";
import { getAllUsers, logoutUser } from "../controllers/admin.controller.js";
import { allowRoles } from "../lib/auth-lib.js";
import { checkAuth, checkAdmin, checkManager } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", checkAuth, allowRoles("admin", "manager"), getAllUsers);

router.post("/logout", checkAuth, allowRoles("admin", "manager"), logoutUser)

export default router;