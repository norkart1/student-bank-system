import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { Session } from '@/lib/models/Session';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // For now, let's allow teachers to be a type of Admin or a specific Teacher model if it exists
    // Given the prompt, I'll check if a Teacher model exists, otherwise I'll use Admin with a role check
    // Actually, I'll create a dedicated Teacher model if it doesn't exist, but for the API I'll assume we might use Admin for now to unblock
    
    const user = await Admin.findOne({ username, role: 'teacher' });

    if (!user) {
      // Fallback to checking any admin if we haven't set up roles yet, or just fail for security
      return NextResponse.json({ error: 'Invalid teacher credentials' }, { status: 401 });
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
      userType: 'teacher',
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
      teacher: {
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
    console.error('Teacher login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
