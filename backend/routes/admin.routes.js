import { Router } from "express";
import { deleteUser, getAllUsers, logoutById } from "../controllers/admin.controller.js";
import { allowRoles } from "../lib/auth-lib.js";
import { checkAuth, checkAdmin, checkManager, checkDeleted } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", checkAuth, checkDeleted, allowRoles(["admin", "manager"]), getAllUsers);

router.post("/logout", checkAuth, checkDeleted, allowRoles(["admin", "manager"]), logoutById);

router.delete("/users/:userId", checkAuth, checkDeleted,allowRoles("admin"), deleteUser);

export default router;