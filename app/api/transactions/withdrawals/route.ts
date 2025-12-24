import { connectDB } from '@/lib/mongodb';
import { Withdrawal } from '@/lib/models/Withdrawal';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { studentId, studentName, studentCode, amount, date, reason } = await req.json();

    if (!studentId || !studentName || !studentCode || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const withdrawal = new Withdrawal({
      studentId,
      studentName,
      studentCode,
      amount,
      date,
      reason,
    });

    await withdrawal.save();
    return NextResponse.json(withdrawal, { status: 201 });
  } catch (error) {
    console.error('Withdrawal creation error:', error);
    return NextResponse.json({ error: 'Failed to create withdrawal record' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const studentCode = searchParams.get('studentCode');

    let query: any = {};
    if (studentId) query.studentId = studentId;
    if (studentCode) query.studentCode = studentCode;

    const withdrawals = await Withdrawal.find(query).sort({ createdAt: -1 });
    
    const response = NextResponse.json(withdrawals);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Withdrawal fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 });
  }
}
