import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  debug: true, // show debug output
  logger: true // log information in console
});

export const sendOTPEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"JDSA Students Bank" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'JDSA Students Bank - Admin OTP',
    text: `Your OTP for JDSA Students Bank admin login is: ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 500px; margin: auto; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
           <h2 style="color: #2d6a4f; margin: 0; font-size: 24px;">JDSA Students Bank</h2>
           <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Official Admin Portal</p>
        </div>
        <div style="background-color: #f8fdfa; padding: 25px; border-radius: 10px; text-align: center; border: 1px solid #d8f3dc;">
          <p style="color: #374151; font-size: 16px; margin-top: 0;">Your OTP for admin login is:</p>
          <h1 style="color: #2d6a4f; letter-spacing: 8px; font-size: 38px; margin: 15px 0; font-weight: bold;">${otp}</h1>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">This code will expire in <span style="font-weight: 600; color: #1b4332;">5 minutes</span>.</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 25px; text-align: center; line-height: 1.5;">
          If you didn't request this code, please secure your account or ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};