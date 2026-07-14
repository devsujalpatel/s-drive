import { Router } from "express";
import { verifyOtp, sendOtp, loginWithGoogle, connectGoogleDrive, googleDriveCallback } from "../controllers/auth.controller.js";
import {checkAuth, checkDeleted} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/google", loginWithGoogle);

router.get("/google-drive/connect", connectGoogleDrive);

router.get("/callback/google", checkAuth, checkDeleted, googleDriveCallback);



export default router;
