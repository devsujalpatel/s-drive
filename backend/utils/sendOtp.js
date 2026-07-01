import { Resend } from "resend";
import OTP from "../models/otpModel.js"

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtp(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Upsert OTP (replace if already exists and create new if not)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Data() },
    {upsert: true}
  )


  const html = `
    <div style="font-family:sans-serif;">
      <h1>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
    `

  await resend.emails.send({
    from: "Storage App <otp@sujalpatel.tech>",
    to: email,
    subject: "Storage App OTP",
    html,
  })
  return { success: true, message: "OTP sent successfully" };
  
}