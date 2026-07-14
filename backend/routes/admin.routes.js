import { Router } from "express";
import { deleteUser, deleteUserHard, getAllUsers, logoutById } from "../controllers/admin.controller.js";
import { allowRoles } from "../lib/auth-lib.js";
import { checkAuth, checkAdmin, checkManager, checkDeleted } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/users", checkAuth, checkDeleted, allowRoles([ "OWNER", "ADMIN", "MANAGER"]), getAllUsers);

router.post("/logout", checkAuth, checkDeleted, allowRoles(["OWNER", "ADMIN", "MANAGER"]), logoutById);

router.delete("/users/:userId", checkAuth, checkDeleted,allowRoles(["OWNER", "ADMIN"]), deleteUser);

router.delete("/users/:userId/hard", checkAuth, checkDeleted, allowRoles(["OWNER"]), deleteUserHard);

export default router;