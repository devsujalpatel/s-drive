import { Router } from "express";
import { deleteUserHard, recoverUser } from "../controllers/owner.controller.js";
import { checkAuth, checkDeleted, } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../lib/auth-lib.js";


const router = Router();

router.delete("/users/:userId/hard", checkAuth, checkDeleted, allowRoles(["OWNER"]), deleteUserHard);

router.post("/users/:userId/recover", checkAuth, checkDeleted, allowRoles(["OWNER"]), recoverUser)

export default router;