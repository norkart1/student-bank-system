import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendOTPEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'Admin Login OTP',
    text: `Your OTP for admin login is: ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">Admin Login OTP</h2>
        <p>Your OTP for admin login is:</p>
        <h1 style="color: #007bff; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
        <p>This code will expire in 5 minutes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};