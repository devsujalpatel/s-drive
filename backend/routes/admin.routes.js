import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  logoutById,
} from "../controllers/admin.controller.js";
import { allowRoles } from "../lib/auth-lib.js";
import { checkAuth, checkDeleted } from "../middlewares/auth.middleware.js";
import validateId from "../middlewares/validated.middleware.js";

const router = Router();

router.param("userId", validateId);

router.get(
  "/users",
  checkAuth,
  checkDeleted,
  allowRoles(["OWNER", "ADMIN", "MANAGER"]),
  getAllUsers,
);

router.post(
  "/logout",
  checkAuth,
  checkDeleted,
  allowRoles(["OWNER", "ADMIN", "MANAGER"]),
  logoutById,
);

router.delete(
  "/users/:userId",
  checkAuth,
  checkDeleted,
  allowRoles(["OWNER", "ADMIN"]),
  deleteUser,
);

export default router;
