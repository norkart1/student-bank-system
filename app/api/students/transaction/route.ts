import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { studentId, type, amount, reason, date } = await req.json();
    
    if (!studentId || !type || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    // Update balance
    if (type === 'deposit') {
      student.balance += amount;
    } else if (type === 'withdraw') {
      if (student.balance < amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }
      student.balance -= amount;
    }
    
    // Add transaction
    student.transactions.push({
      type,
      amount,
      date: date || new Date().toLocaleDateString(),
      reason
    });
    
    await student.save();
    return NextResponse.json(student);
  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json({ error: 'Transaction failed' }, { status: 500 });
  }
}
