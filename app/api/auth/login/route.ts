import { connectDB } from '@/lib/mongodb';
import { Session } from '@/lib/models/Session';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { code, name, type } = await req.json();

    if (!code && !name) {
      return NextResponse.json({ error: 'Code or name required' }, { status: 400 });
    }

    if (type !== 'user') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Find student
    let student;
    if (code) {
      student = await Student.findOne({ code: code.toUpperCase() });
    } else if (name) {
      student = await Student.findOne({ name: { $regex: name, $options: 'i' } });
    }

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = new Session({
      token,
      userId: student._id.toString(),
      userType: 'user',
      userData: {
        id: student._id.toString(),
        name: student.name,
        code: student.code,
      },
      expiresAt,
    });

    await session.save();

    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: student._id,
          name: student.name,
          code: student.code,
        },
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
