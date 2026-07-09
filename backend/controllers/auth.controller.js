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


export const googleAuthCallback = async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      error: "No code provided",
    });
  }

  try {
    const response = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: "authorization_code",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};


