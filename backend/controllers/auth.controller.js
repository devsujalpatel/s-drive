import OTP from "../models/otpModel.js";
import { sendOtpService } from "../services/sendOtpService.js";

export const sendOtp= async (req, res, next) => {
  try {
    const { email } = req.body;
    const resData = await sendOtpService(email);
    res.status(201).json(resData);
  } catch (err) {
    next(err);
  }
}

export const verifyOtp = async (req, res, next) => {
  try { 
     const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    res.status(400).json({error: 'Invalid or Expired OTP'})
  }
  res.json({ message: 'OTP Verified!' });
  } catch (err) {
    next(err)
  }
 }



