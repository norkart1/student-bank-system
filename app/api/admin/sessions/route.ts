import { connectDB } from '@/lib/mongodb';
import { Session } from '@/lib/models/Session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userType = req.nextUrl.searchParams.get('type') || 'admin';
    const sessions = await Session.find({ userType })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
