import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Wallet } from 'ethers';
import { PushAPI } from '@pushprotocol/restapi';
import { NotifyClient } from '@walletconnect/notify-client';
import { formatTokenAmount } from '@/lib/hooks';
import { TARGET_CHAIN_ID, TARGET_CHAIN_NAME } from '@/lib/web3';
import {
  NotificationContext,
  type NotificationContextValue,
  type StreamEventPayload,
} from './NotificationContextBase';

const PUSH_CHANNEL_ADDRESS = import.meta.env.VITE_PUSH_CHANNEL_ADDRESS as string | undefined;
const PUSH_CHANNEL_PK = import.meta.env.VITE_PUSH_CHANNEL_PK as string | undefined;
const PUSH_ENV = (import.meta.env.VITE_PUSH_ENV as string | undefined) ?? 'staging';

const WC_NOTIFY_PROJECT_ID = (import.meta.env.VITE_WALLETCONNECT_NOTIFY_PROJECT_ID as string | undefined) ?? import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const WC_NOTIFY_SECRET = import.meta.env.VITE_WALLETCONNECT_NOTIFY_SECRET as string | undefined;

const chainPrefix = `eip155:${TARGET_CHAIN_ID}`;
const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://streampay.example';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const pushSignerRef = useRef<Wallet | null>(null);
  const pushInitializedRef = useRef(false);
  const notifyClientRef = useRef<NotifyClient | null>(null);
  const reminderCacheRef = useRef<Map<string, bigint>>(new Map());

  useEffect(() => {
    if (!PUSH_CHANNEL_ADDRESS || !PUSH_CHANNEL_PK || pushInitializedRef.current) {
      return;
    }

    try {
      pushSignerRef.current = new Wallet(PUSH_CHANNEL_PK);
      pushInitializedRef.current = true;
    } catch (error) {
      console.error('Failed to initialize Push Protocol signer', error);
    }
  }, []);

  useEffect(() => {
    if (!WC_NOTIFY_PROJECT_ID || !WC_NOTIFY_SECRET || notifyClientRef.current) {
      return;
    }

    let mounted = true;
    const init = async () => {
      try {
        const client = await NotifyClient.init({
          projectId: WC_NOTIFY_PROJECT_ID,
          secretKey: WC_NOTIFY_SECRET,
        });
        if (mounted) {
          notifyClientRef.current = client;
        }
      } catch (error) {
        console.error('Failed to initialize WalletConnect Notify client', error);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const notifyPush = useCallback(
    async (title: string, body: string, recipients: `0x${string}`[]) => {
      if (!pushSignerRef.current || !PUSH_CHANNEL_ADDRESS || recipients.length === 0) {
        return;
      }

      try {
        await PushAPI.payloads.sendNotification({
          signer: pushSignerRef.current,
          type: 3,
          identityType: 2,
          notification: { title, body },
          payload: {
            title,
            body,
            cta: appOrigin,
            img: '',
          },
          recipients,
          channel: PUSH_CHANNEL_ADDRESS,
          env: PUSH_ENV,
        });
      } catch (error) {
        console.error('Push notification failed', error);
      }
    },
    [],
  );

  const notifyWalletConnect = useCallback(
    async (title: string, body: string, recipients: `0x${string}`[]) => {
      if (!notifyClientRef.current || recipients.length === 0) {
        return;
      }

      try {
        await notifyClientRef.current.notify({
          accounts: recipients.map((addr) => `${chainPrefix}:${addr}`),
          notification: { title, body, url: appOrigin },
          type: 'streampay.update',
        });
      } catch (error) {
        console.error('WalletConnect notification failed', error);
      }
    },
    [],
  );

  const sendNotification = useCallback(
    async (title: string, body: string, recipients: `0x${string}`[]) => {
      if (recipients.length === 0) {
        return;
      }

      await Promise.all([
        notifyPush(title, body, recipients),
        notifyWalletConnect(title, body, recipients),
      ]);
    },
    [notifyPush, notifyWalletConnect],
  );

  const notifyStreamEvent = useCallback(
    async ({ type, stream, actor, recipients, count }: StreamEventPayload) => {
      const targetRecipients = recipients ?? [stream.recipient];
      const formattedAmount = formatTokenAmount(stream.totalAmount, stream.tokenDecimals);
      const tokenLabel = stream.tokenSymbol ?? 'tokens';

      let title = 'StreamPay Update';
      let body = '';

      switch (type) {
        case 'create':
          title = 'New payment stream created';
          body = `You are receiving ${formattedAmount} ${tokenLabel} over ${Number(stream.duration)} seconds from ${stream.sender.slice(0, 6)}...${stream.sender.slice(-4)}.`;
          break;
        case 'batch-create':
          title = 'New payroll streams created';
          body = `${count ?? recipients?.length ?? 1} streams started on ${TARGET_CHAIN_NAME}.`;
          break;
        case 'pause':
          title = 'Stream paused';
          body = `Stream #${stream.id} has been paused by ${actor?.slice(0, 6)}...${actor?.slice(-4)}.`;
          break;
        case 'resume':
          title = 'Stream resumed';
          body = `Streaming has resumed for stream #${stream.id}.`;
          break;
        case 'cancel':
          title = 'Stream cancelled';
          body = `Stream #${stream.id} was cancelled. Remaining funds are available to withdraw.`;
          break;
        case 'claim':
          title = 'Stream claimed';
          body = `${actor?.slice(0, 6)}...${actor?.slice(-4)} claimed from stream #${stream.id}.`;
          break;
      }

      await sendNotification(title, body, targetRecipients);
    },
    [sendNotification],
  );

  const processReminderSnapshot = useCallback(
    async (streams: Stream[]) => {
      for (const stream of streams) {
        if (!stream.isActive || stream.isPaused) {
          reminderCacheRef.current.delete(stream.id.toString());
          continue;
        }

        const claimable = stream.streamableAmount ?? 0n;
        if (claimable === 0n) {
          reminderCacheRef.current.delete(stream.id.toString());
          continue;
        }

        const threshold = stream.totalAmount / 20n; // notify every 5%
        const minimum = threshold > 0n ? threshold : 1n;
        const lastNotified = reminderCacheRef.current.get(stream.id.toString()) ?? 0n;

        if (claimable >= minimum && claimable - lastNotified >= minimum) {
          const formatted = formatTokenAmount(claimable, stream.tokenDecimals);
          const tokenLabel = stream.tokenSymbol ?? 'tokens';
          await sendNotification(
            'Funds ready to claim',
            `You can claim ${formatted} ${tokenLabel} from stream #${stream.id}.`,
            [stream.recipient],
          );
          reminderCacheRef.current.set(stream.id.toString(), claimable);
        }
      }
    },
    [sendNotification],
  );

  const value = useMemo<NotificationContextValue>(() => ({
    notifyStreamEvent,
    processReminderSnapshot,
  }), [notifyStreamEvent, processReminderSnapshot]);

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
};
