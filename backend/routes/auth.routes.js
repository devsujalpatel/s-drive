import { Router } from "express";
import { verifyOtp, sendOtp, loginWithGoogle} from "../controllers/auth.controller.js";

const router = Router();

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/google", loginWithGoogle);



export default router;
