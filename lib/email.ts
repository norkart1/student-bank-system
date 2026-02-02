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
      <div style="font-family: 'Poppins', sans-serif, system-ui; padding: 40px 20px; background-color: #f3f4f6; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #1b4332; padding: 30px; color: #ffffff;">
            <h2 style="margin: 0; font-size: 26px; font-weight: 700;">JDSA Students Bank</h2>
            <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Official Admin Portal</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px;">Hello Administrator,</p>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 10px;">Your secure access code is:</p>
            
            <div style="background-color: #f8fdfa; border: 2px dashed #2d6a4f; border-radius: 16px; padding: 25px; margin: 20px 0;">
              <h1 style="color: #2d6a4f; letter-spacing: 12px; font-size: 48px; margin: 0; font-weight: 800; display: inline-block;">${otp}</h1>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              This code will expire in <span style="font-weight: 700; color: #1b4332;">5 minutes</span>.
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 25px; border-top: 1px solid #f1f5f9;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
              If you did not request this code, please ignore this email or contact security if you suspect unauthorized access.
            </p>
          </div>
        </div>
        <p style="margin-top: 20px; color: #9ca3af; font-size: 11px;">© 2026 JDSA Students Bank. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};