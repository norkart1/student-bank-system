import { connectDB } from '@/lib/mongodb';
import { Deposit } from '@/lib/models/Deposit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { studentId, studentName, studentCode, amount, date, reason } = await req.json();

    if (!studentId || !studentName || !studentCode || !amount || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const deposit = new Deposit({
      studentId,
      studentName,
      studentCode,
      amount,
      date,
      reason,
    });

    await deposit.save();
    return NextResponse.json(deposit, { status: 201 });
  } catch (error) {
    console.error('Deposit creation error:', error);
    return NextResponse.json({ error: 'Failed to create deposit record' }, { status: 500 });
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

    const deposits = await Deposit.find(query).sort({ createdAt: -1 });
    
    const response = NextResponse.json(deposits);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Deposit fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch deposits' }, { status: 500 });
  }
}
