import { NextRequest, NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { socket_id, channel_name } = data;

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Authenticate private/presence channels
    const auth = pusher.authenticate(socket_id, channel_name);
    
    return NextResponse.json(auth);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
