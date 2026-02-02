import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found with this email' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    admin.otpCode = otp;
    admin.otpExpires = otpExpires;
    await admin.save();

    await sendOTPEmail(email, otp);

    return NextResponse.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}