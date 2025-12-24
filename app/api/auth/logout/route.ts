import { connectDB } from '@/lib/mongodb';
import { Session } from '@/lib/models/Session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = req.cookies.get('auth_token')?.value;

    if (token) {
      await Session.deleteOne({ token });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', '', { maxAge: 0 });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
