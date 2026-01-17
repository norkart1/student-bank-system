import { NextRequest, NextResponse } from 'next/server';
import { pusher, CHANNELS } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, studentId, update } = data;

    if (!type) {
      return NextResponse.json(
        { error: 'Missing broadcast type' },
        { status: 400 }
      );
    }

    // Broadcast different types of updates
    if (type === 'balance-update' && studentId && update) {
      // Notify specific student of balance change
      await pusher.trigger(
        CHANNELS.BALANCE_UPDATE(studentId),
        'balance-changed',
        update
      );

      // Send Discord notification
      try {
        const { sendTransactionNotification } = await import('@/lib/discord/notifications');
        await sendTransactionNotification(
          update.studentName || `Student ID: ${studentId}`, 
          update.amount, 
          update.amount > 0 ? 'deposit' : 'withdraw', 
          update.balance
        );
      } catch (err) {
        console.error('Discord notification failed:', err);
      }
    } else if (type === 'students-list-update') {
      // Notify admin of student list changes
      await pusher.trigger(
        CHANNELS.STUDENTS,
        'list-updated',
        { timestamp: new Date().toISOString() }
      );
    } else if (type === 'transaction-added' && studentId) {
      // Notify student of new transaction
      await pusher.trigger(
        CHANNELS.BALANCE_UPDATE(studentId),
        'transaction-added',
        update
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher broadcast error:', error);
    return NextResponse.json(
      { error: 'Broadcast failed' },
      { status: 500 }
    );
  }
}
