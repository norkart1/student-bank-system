import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { Session } from '@/lib/models/Session';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Special hardcoded credentials for committee as requested
    if (username === 'com' && password === '12345') {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const session = new Session({
        token,
        userId: 'committee_hardcoded_id',
        userType: 'committee',
        userData: {
          id: 'committee_hardcoded_id',
          name: 'Committee Member',
          username: 'com',
        },
        expiresAt,
      });

      await session.save();

      const response = NextResponse.json({
        success: true,
        token,
        committee: {
          id: 'committee_hardcoded_id',
          username: 'com',
          name: 'Committee Member',
        },
      });

      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // Check database for committee users if any
    const user = await Admin.findOne({ username, role: 'committee' });

    if (!user) {
      return NextResponse.json({ error: 'Invalid committee credentials' }, { status: 401 });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = new Session({
      token,
      userId: user._id.toString(),
      userType: 'committee',
      userData: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
      },
      expiresAt,
    });

    await session.save();

    const response = NextResponse.json({
      success: true,
      token,
      committee: {
        id: user._id,
        username: user.username,
        name: user.name,
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
    console.error('Committee login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
