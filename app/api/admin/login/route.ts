import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { Session } from '@/lib/models/Session';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    const admin = await Admin.findOne({ 
      email,
      otpCode: otp,
      otpExpires: { $gt: new Date() }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Clear OTP after successful login
    admin.otpCode = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = new Session({
      token,
      userId: admin._id.toString(),
      userType: 'admin',
      userData: {
        id: admin._id.toString(),
        name: admin.name,
        username: admin.username,
      },
      expiresAt,
    });

    await session.save();

    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
