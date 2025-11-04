import { createContext } from 'react';

import type { Stream } from '@/lib/contract';

export interface StreamEventPayload {
  type: 'create' | 'batch-create' | 'pause' | 'resume' | 'cancel' | 'claim';
  stream: Stream;
  actor?: `0x${string}`;
  recipients?: `0x${string}`[];
  count?: number;
}

export interface NotificationContextValue {
  notifyStreamEvent: (payload: StreamEventPayload) => Promise<void>;
  processReminderSnapshot: (streams: Stream[]) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
