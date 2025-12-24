import Pusher from 'pusher';
import PusherJs from 'pusher-js';

// Server-side Pusher instance
export const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

// Client-side Pusher instance
export const getPusherClient = () => {
  if (typeof window === 'undefined') return null;
  
  const pusherClient = new PusherJs(
    process.env.NEXT_PUBLIC_PUSHER_KEY || '',
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
      forceTLS: true,
    }
  );
  
  return pusherClient;
};

// Channel names
export const CHANNELS = {
  STUDENTS: 'students',
  BALANCE_UPDATE: (studentId: string) => `balance-${studentId}`,
  ADMIN: 'admin-channel',
};
