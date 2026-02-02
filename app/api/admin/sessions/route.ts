import { connectDB } from '@/lib/mongodb';
import { Session } from '@/lib/models/Session';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userType = req.nextUrl.searchParams.get('type') || 'admin';
    const sessions = await Session.find({ userType })
      .sort({ createdAt: -1 })
      .limit(20);

    // If student searches, fetch real-time balance for each student
    if (userType === 'student') {
      const enhancedSessions = await Promise.all(sessions.map(async (session) => {
        const student = await Student.findById(session.userId);
        if (student) {
          const sessionObj = session.toObject();
          sessionObj.userData = {
            ...sessionObj.userData,
            balance: student.balance,
            profileImage: student.profileImage || sessionObj.userData.profileImage,
            name: student.name,
            code: student.code
          };
          return sessionObj;
        }
        return session;
      }));
      return NextResponse.json(enhancedSessions);
    }

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
