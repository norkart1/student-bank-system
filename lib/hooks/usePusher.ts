import { useEffect, useCallback } from 'react';
import { getPusherClient, CHANNELS } from '@/lib/pusher';

export function usePusherUpdates(studentId?: string, onUpdate?: (data: any) => void) {
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    if (studentId) {
      // Subscribe to balance updates for specific student
      const channel = pusher.subscribe(CHANNELS.BALANCE_UPDATE(studentId));

      channel.bind('balance-changed', (data: any) => {
        if (onUpdate) onUpdate({ type: 'balance-changed', ...data });
      });

      channel.bind('transaction-added', (data: any) => {
        if (onUpdate) onUpdate({ type: 'transaction-added', ...data });
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(CHANNELS.BALANCE_UPDATE(studentId));
      };
    }
  }, [studentId, onUpdate]);
}

export function usePusherAdminUpdates(onUpdate?: (data: any) => void) {
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(CHANNELS.STUDENTS);

    channel.bind('list-updated', (data: any) => {
      if (onUpdate) onUpdate({ type: 'list-updated', ...data });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.STUDENTS);
    };
  }, [onUpdate]);
}
