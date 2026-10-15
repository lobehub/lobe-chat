import type { CodexForkTarget } from '@lobechat/types';
import { vi } from 'vitest';

import type { UsageData } from '../types';
import { CodexThreadSession } from './CodexThreadSession';

export const turn = (id: string, status: 'completed' | 'inProgress' | 'interrupted') => ({
  completedAt: status === 'inProgress' ? null : 2,
  durationMs: status === 'inProgress' ? null : 1000,
  error: null,
  id,
  items: [],
  itemsView: 'full',
  startedAt: 1,
  status,
});

export interface ClientHarness {
  client: any;
  disconnect: () => void;
  notify: (method: string, params: unknown) => Promise<void> | void;
  registeredResumeParams: () => unknown;
  releaseConsumer: ReturnType<typeof vi.fn>;
  requests: Array<{ method: string; params: unknown }>;
  resolveThreadStart: () => void;
  resolveTurnStart: () => void;
  resume: (model?: string) => Promise<void> | void;
}

export const createClientHarness = (
  options: {
    autoComplete?: boolean;
    delayThreadStart?: boolean;
    delayTurnStart?: boolean;
    disconnectOnInterrupt?: boolean;
    connectError?: Error;
    failResume?: boolean;
    /** Simulates a Codex build that ignores `lastTurnId` and copies the whole source. */
    forkIgnoresLastTurn?: boolean;
    initialThreadId?: string;
    interruptError?: Error;
    malformedThreadStart?: boolean;
    /** Statuses returned by successive `thread/resume` calls; later calls report idle. */
    resumeStatuses?: Array<'active' | 'idle' | 'systemError'>;
    sourceTurnIds?: string[];
    threadNameError?: Error;
  } = {},
): ClientHarness => {
  let disconnectHandler: (() => void) | undefined;
  let notificationHandler: ((method: string, params: unknown) => Promise<void>) | undefined;
  let registration:
    | {
        onResume: (response: unknown) => Promise<void> | void;
        onResumeError: (error: Error) => Promise<void> | void;
      }
    | undefined;
  let resumeParams: unknown;
  let turnSequence = 0;
  const releaseConsumer = vi.fn();
  const requests: Array<{ method: string; params: unknown }> = [];
  const notify = (method: string, params: unknown) => notificationHandler?.(method, params);
  let resolveThreadStart = () => {};
  const threadStartGate = options.delayThreadStart
    ? new Promise<void>((resolve) => {
        resolveThreadStart = resolve;
      })
    : Promise.resolve();
  let resolveTurnStart = () => {};
  const turnStartGate = options.delayTurnStart
    ? new Promise<void>((resolve) => {
        resolveTurnStart = resolve;
      })
    : Promise.resolve();

  const client = {
    acquireConsumer: vi.fn(() => releaseConsumer),
    acquireThread: vi.fn(() => vi.fn()),
    connect: options.connectError
      ? vi.fn().mockRejectedValue(options.connectError)
      : vi.fn().mockResolvedValue({ userAgent: 'codex-test' }),
    onDisconnect: vi.fn((handler: () => void) => {
      disconnectHandler = handler;
      return vi.fn();
    }),
    onRawMessage: vi.fn(() => vi.fn()),
    onStderr: vi.fn(() => vi.fn()),
    registerThread: vi.fn((_threadId: string, params: unknown, value: typeof registration) => {
      resumeParams = params;
      registration = value;
      return vi.fn(() => {
        if (registration === value) registration = undefined;
      });
    }),
    request: vi.fn(async (method: string, params: unknown) => {
      requests.push({ method, params });
      if (method === 'thread/start') {
        await threadStartGate;
        if (options.malformedThreadStart) return { thread: {} };
        return {
          approvalPolicy: 'never',
          model: 'gpt-5.5-codex',
          cwd: '/workspace',
          sandbox: { type: 'dangerFullAccess' },
          thread: { id: 'thread-1' },
        };
      }
      if (method === 'thread/resume' || method === 'thread/read') {
        if (options.failResume) throw new Error('Thread not found');
        return {
          approvalPolicy: 'never',
          model: 'gpt-5.5-codex',
          cwd: '/workspace',
          sandbox: { type: 'dangerFullAccess' },
          thread: {
            id: options.initialThreadId ?? 'thread-1',
            status: { type: options.resumeStatuses?.shift() ?? 'idle' },
            turns: (options.sourceTurnIds ?? []).map((id) => turn(id, 'completed')),
          },
        };
      }
      if (method === 'thread/fork') {
        const sourceTurnIds = options.sourceTurnIds ?? [];
        const { lastTurnId } = params as { lastTurnId: string };
        const retained = options.forkIgnoresLastTurn
          ? sourceTurnIds
          : sourceTurnIds.slice(0, sourceTurnIds.indexOf(lastTurnId) + 1);
        return {
          approvalPolicy: 'never',
          cwd: '/workspace',
          sandbox: { type: 'dangerFullAccess' },
          model: 'gpt-5.5-codex',
          thread: { id: 'thread-forked', turns: retained.map((id) => turn(id, 'completed')) },
        };
      }
      if (method === 'thread/archive') return {};
      if (method === 'thread/name/set') {
        if (options.threadNameError) throw options.threadNameError;
        return {};
      }
      if (method === 'turn/start') {
        await turnStartGate;
        const turnId = `turn-${++turnSequence}`;
        if (options.autoComplete !== false) {
          setTimeout(() => {
            void notify('turn/started', {
              threadId: options.initialThreadId ?? 'thread-1',
              turn: turn(turnId, 'inProgress'),
            });
            void notify('item/agentMessage/delta', {
              delta: `answer-${turnSequence}`,
              itemId: `message-${turnSequence}`,
              threadId: options.initialThreadId ?? 'thread-1',
              turnId,
            });
            void notify('turn/completed', {
              threadId: options.initialThreadId ?? 'thread-1',
              turn: turn(turnId, 'completed'),
            });
          }, 0);
        }
        return { turn: turn(turnId, 'inProgress') };
      }
      if (method === 'turn/interrupt') {
        if (options.disconnectOnInterrupt) disconnectHandler?.();
        if (options.interruptError) throw options.interruptError;
        const { threadId, turnId } = params as { threadId: string; turnId: string };
        setTimeout(() => {
          void notify('turn/completed', {
            threadId,
            turn: turn(turnId, 'interrupted'),
          });
        }, 0);
        return {};
      }
    }),
    subscribe: vi.fn((_threadId: string, handler: typeof notificationHandler) => {
      notificationHandler = handler;
      return vi.fn();
    }),
    subscribeServerRequests: vi.fn(() => vi.fn()),
  };

  return {
    client,
    disconnect: () => disconnectHandler?.(),
    notify,
    registeredResumeParams: () => resumeParams,
    releaseConsumer,
    requests,
    resolveThreadStart,
    resolveTurnStart,
    resume: (model = 'gpt-5.5-codex') =>
      registration?.onResume({
        approvalPolicy: 'never',
        model,
        sandbox: { type: 'dangerFullAccess' },
        thread: { id: options.initialThreadId ?? 'thread-1' },
      }),
  };
};

export const createSession = (
  harness: ClientHarness,
  options: {
    ephemeral?: boolean;
    forkTarget?: CodexForkTarget;
    initialCumulativeUsage?: UsageData;
    initialThreadId?: string;
    onEventsError?: Error;
    threadName?: string;
  } = {},
) => {
  const events: any[] = [];
  const statuses: string[] = [];
  const onSessionId = vi.fn();
  const session = new CodexThreadSession({
    client: harness.client,
    forkTarget: options.forkTarget,
    initialCumulativeUsage: options.initialCumulativeUsage,
    initialThreadId: options.initialThreadId,
    threadName: options.threadName,
    onEvents: (batch) => {
      if (options.onEventsError) throw options.onEventsError;
      events.push(...batch);
    },
    onRuntimeStatus: ({ state }) => statuses.push(state),
    onSessionId,
    sessionId: 'session-1',
    threadParams: {
      approvalPolicy: 'never',
      cwd: '/workspace',
      ...(options.ephemeral ? { ephemeral: true } : {}),
      sandbox: 'danger-full-access',
    },
  });
  const run = (operationId: string, text: string) =>
    session.run({
      input: [{ text, text_elements: [], type: 'text' }],
      onRawMessage: vi.fn(),
      operationId,
    });
  return { events, onSessionId, run, session, statuses };
};
