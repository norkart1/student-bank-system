import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { AcademicSession } from '@/lib/models/AcademicSession';

export async function GET() {
  try {
    await dbConnect();
    const sessions = await AcademicSession.find({}).sort({ year: 1 });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { year } = await request.json();
    if (!year) return NextResponse.json({ error: 'Year is required' }, { status: 400 });

    await dbConnect();
    const session = await AcademicSession.create({ year });
    return NextResponse.json(session);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Session already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
