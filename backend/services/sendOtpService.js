import { Resend } from "resend";
import OTP from "../models/otpModel.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpService(email) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Upsert OTP (replace if already exists and create new if not)
  await OTP.findOneAndUpdate(
    { email },
    { otp, createdAt: new Date() },
    { upsert: true },
  );

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Inter,Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:560px;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 10px 30px rgba(0,0,0,0.08);
          "
        >
          <tr>
            <td
              style="
                background:linear-gradient(135deg,#6366f1,#8b5cf6);
                padding:32px;
                text-align:center;
              "
            >
              <h1
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:28px;
                  font-weight:700;
                "
              >
                Verify Your Email
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 32px;text-align:center;">
              <p
                style="
                  margin:0 0 16px;
                  color:#374151;
                  font-size:18px;
                  font-weight:600;
                "
              >
                Use the verification code below
              </p>

              <div
                style="
                  display:inline-block;
                  background:#eef2ff;
                  color:#4338ca;
                  font-size:36px;
                  font-weight:700;
                  letter-spacing:8px;
                  padding:18px 32px;
                  border-radius:12px;
                  margin:16px 0 24px;
                "
              >
                ${otp}
              </div>

              <p
                style="
                  margin:0;
                  color:#6b7280;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                This verification code is valid for
                <strong>10 minutes</strong>.
              </p>

              <p
                style="
                  margin:24px 0 0;
                  color:#9ca3af;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td
              style="
                border-top:1px solid #e5e7eb;
                padding:20px;
                text-align:center;
                color:#9ca3af;
                font-size:13px;
              "
            >
              © ${new Date().getFullYear()} Storage App. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await resend.emails.send({
    from: "Storage App <otp@sujalpatel.tech>",
    to: email,
    subject: "Storage App OTP",
    html,
  });
  return { success: true, message: `OTP sent successfully on ${email}` };
}
