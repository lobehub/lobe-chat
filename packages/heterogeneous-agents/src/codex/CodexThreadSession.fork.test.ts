import { describe, expect, it, vi } from 'vitest';

import { createClientHarness, createSession, turn } from './testUtils';

describe('CodexThreadSession Fork', () => {
  // Editing turn zero starts a fresh thread, but prompt preparation and token
  // accounting previously treated the source resume ID as retained history.
  /** @example First-turn edits receive new-session input and their full usage. */
  it('prepares fresh input and resets usage when forking at the first turn', async () => {
    const harness = createClientHarness({ autoComplete: false, sourceTurnIds: ['source-turn'] });
    const { events, session } = createSession(harness, {
      forkTarget: { position: 'before', threadId: 'source-thread', turnId: 'source-turn' },
      initialThreadId: 'source-thread',
      initialCumulativeUsage: {
        inputCacheMissTokens: 100,
        totalInputTokens: 100,
        totalOutputTokens: 0,
        totalTokens: 100,
      },
    });
    const input = vi.fn(async (isNewSession: boolean) => [
      {
        text: isNewSession ? 'introduction and edited prompt' : 'edited prompt',
        text_elements: [],
        type: 'text' as const,
      },
    ]);
    const run = session.run({ input, operationId: 'edit-first', onRawMessage: vi.fn() });
    await vi.waitFor(() => {
      /** @example Input reaches the real native turn-start boundary. */
      expect(harness.requests.some((request) => request.method === 'turn/start')).toBe(true);
    });
    await harness.notify('turn/started', {
      threadId: 'thread-1',
      turn: turn('turn-1', 'inProgress'),
    });
    await harness.notify('thread/tokenUsage/updated', {
      threadId: 'thread-1',
      tokenUsage: {
        total: {
          inputTokens: 150,
          cachedInputTokens: 0,
          outputTokens: 0,
          reasoningOutputTokens: 0,
          totalTokens: 150,
        },
      },
    });
    await harness.notify('turn/completed', {
      threadId: 'thread-1',
      turn: turn('turn-1', 'completed'),
    });
    await run;
    session.close();
    /** @example The first edited turn carries instructions for a fresh session. */
    expect(input).toHaveBeenCalledWith(true);
    /** @example Source usage is never subtracted from a new native thread. */
    expect(events).toContainEqual(
      expect.objectContaining({
        type: 'step_complete',
        data: expect.objectContaining({
          usage: expect.objectContaining({ totalInputTokens: 150 }),
        }),
      }),
    );
  });

  // ROOT CAUSE:
  // A retained-prefix fork copied source-tip cumulative usage, including later turns.
  // The child's native total still includes only retained history, so subtracting
  // the tip either undercounts or charges all inherited tokens after a counter reset.
  // Rebase from the first native total/last pair, then accumulate all child steps.
  /** @example Both counter relationships exclude unrelated later source turns. */
  it.each([140, 350])(
    'rebases retained fork usage when the first child total is %i',
    async (firstTotal) => {
      const harness = createClientHarness({
        autoComplete: false,
        sourceTurnIds: ['retained', 'later'],
      });
      const { events, session } = createSession(harness, {
        forkTarget: { position: 'after', threadId: 'source-thread', turnId: 'retained' },
        initialThreadId: 'source-thread',
        initialCumulativeUsage: {
          inputCacheMissTokens: 300,
          totalInputTokens: 300,
          totalOutputTokens: 0,
          totalTokens: 300,
        },
      });
      const run = session.run({ input: [], operationId: 'fork-usage', onRawMessage: vi.fn() });
      await vi.waitFor(() => {
        /** @example Usage is observed only after the child starts its native turn. */
        expect(harness.requests.some((request) => request.method === 'turn/start')).toBe(true);
      });
      await harness.notify('turn/started', {
        threadId: 'thread-1',
        turn: turn('turn-1', 'inProgress'),
      });
      for (const [total, last] of [
        [firstTotal, firstTotal - 100],
        [firstTotal + 20, 20],
      ]) {
        await harness.notify('thread/tokenUsage/updated', {
          threadId: 'thread-1',
          turnId: 'turn-1',
          tokenUsage: {
            total: {
              inputTokens: total,
              cachedInputTokens: 0,
              outputTokens: 0,
              reasoningOutputTokens: 0,
              totalTokens: total,
            },
            last: {
              inputTokens: last,
              cachedInputTokens: 0,
              outputTokens: 0,
              reasoningOutputTokens: 0,
              totalTokens: last,
            },
          },
        });
      }
      await harness.notify('turn/completed', {
        threadId: 'thread-1',
        turn: turn('turn-1', 'completed'),
      });
      await run;
      /** @example Both new steps are billed once; the retained 100 tokens are excluded. */
      expect(events).toContainEqual(
        expect.objectContaining({
          type: 'step_complete',
          data: expect.objectContaining({
            usage: expect.objectContaining({ totalInputTokens: firstTotal - 100 + 20 }),
          }),
        }),
      );
      session.close();
    },
  );

  // ROOT CAUSE:
  // Re-entering ensureThread after a disconnect reused the original fork boundary against
  // the child. Consuming the fork target once makes subsequent connections resume the child.
  /** @example A completed child reconnects without forking its original boundary again. */
  it('resumes the child after a forked session disconnects', async () => {
    const harness = createClientHarness({
      initialThreadId: 'thread-source',
      sourceTurnIds: ['turn-a', 'turn-b'],
    });
    const { run, session } = createSession(harness, {
      initialThreadId: 'thread-source',
      forkTarget: { position: 'after', threadId: 'thread-source', turnId: 'turn-a' },
    });
    await run('operation-1', 'First child prompt');
    harness.disconnect();
    await run('operation-2', 'Continue child');
    session.close();
    expect(harness.requests.filter(({ method }) => method === 'thread/fork')).toHaveLength(1);
    expect(harness.requests).toContainEqual({
      method: 'thread/resume',
      params: expect.objectContaining({ threadId: 'thread-forked' }),
    });
  });

  it('forks a resumed thread at an exact turn boundary before starting the next turn', async () => {
    const harness = createClientHarness({
      initialThreadId: 'thread-source',
      sourceTurnIds: ['turn-a', 'turn-b', 'turn-c'],
    });
    const { onSessionId, run, session } = createSession(harness, {
      forkTarget: { position: 'after', threadId: 'thread-source', turnId: 'turn-b' },
      initialThreadId: 'thread-source',
      threadName: 'Forked work',
    });

    await run('operation-1', 'take another approach');
    session.close();

    expect(harness.requests.slice(0, 4)).toEqual([
      {
        method: 'thread/read',
        params: { includeTurns: true, threadId: 'thread-source' },
      },
      {
        method: 'thread/fork',
        params: expect.objectContaining({ lastTurnId: 'turn-b', threadId: 'thread-source' }),
      },
      {
        method: 'thread/name/set',
        params: { name: 'Forked work', threadId: 'thread-forked' },
      },
      {
        method: 'turn/start',
        params: expect.objectContaining({ threadId: 'thread-forked' }),
      },
    ]);
    expect(onSessionId).toHaveBeenCalledWith('thread-forked');
  });

  // ROOT CAUSE:
  // The fork trusted `lastTurnId` blindly. A Codex build that ignored it would hand the
  // branch every later source turn while the UI showed the shorter history.
  /** @example A child that retained later turns is archived and never runs a prompt. */
  it('archives and rejects a fork whose history passes the requested turn', async () => {
    const harness = createClientHarness({
      forkIgnoresLastTurn: true,
      initialThreadId: 'thread-source',
      sourceTurnIds: ['turn-a', 'turn-b', 'turn-c'],
    });
    const { onSessionId, run, session } = createSession(harness, {
      forkTarget: { position: 'after', threadId: 'thread-source', turnId: 'turn-a' },
      initialThreadId: 'thread-source',
    });

    await expect(run('operation-1', 'branch prompt')).rejects.toThrow(
      'Codex fork ended at turn turn-c instead of turn-a',
    );
    session.close();

    expect(harness.requests.map(({ method }) => method)).toEqual([
      'thread/read',
      'thread/fork',
      'thread/archive',
    ]);
    expect(onSessionId).not.toHaveBeenCalled();
  });

  it('starts a clean thread when a forked first turn keeps no history', async () => {
    const harness = createClientHarness({
      initialThreadId: 'thread-source',
      sourceTurnIds: ['turn-a'],
    });
    const { run, session } = createSession(harness, {
      forkTarget: { position: 'before', threadId: 'thread-source', turnId: 'turn-a' },
      initialThreadId: 'thread-source',
    });

    await run('operation-1', 'edited first prompt');
    session.close();

    expect(harness.requests.map(({ method }) => method)).toEqual([
      'thread/read',
      'thread/start',
      'turn/start',
    ]);
  });
});
