import { connectDB } from '@/lib/mongodb';
import { Deposit } from '@/lib/models/Deposit';
import { Withdrawal } from '@/lib/models/Withdrawal';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Create sample documents to initialize collections
    const sampleDeposit = new Deposit({
      studentId: 'init',
      studentName: 'System',
      studentCode: 'INIT-0000',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      reason: 'Collection initialization',
    });

    const sampleWithdrawal = new Withdrawal({
      studentId: 'init',
      studentName: 'System',
      studentCode: 'INIT-0000',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      reason: 'Collection initialization',
    });

    await sampleDeposit.save();
    await sampleWithdrawal.save();

    // Delete the sample documents
    await Deposit.deleteOne({ _id: sampleDeposit._id });
    await Withdrawal.deleteOne({ _id: sampleWithdrawal._id });

    return NextResponse.json({
      success: true,
      message: 'Collections initialized. Deposits and withdrawals collections are now created in MongoDB.',
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 });
  }
}
