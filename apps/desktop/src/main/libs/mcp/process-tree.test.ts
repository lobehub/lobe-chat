import { EventEmitter } from 'node:events';

import { describe, expect, it, vi } from 'vitest';

import {
  reapOrphanedProcessGroup,
  signalProcessTree,
  terminatePrecheckProcess,
} from './process-tree';

describe('terminatePrecheckProcess', () => {
  const makeFakeChild = (pid?: number) => {
    const listeners: Record<string, (() => void)[]> = {};
    const child = new EventEmitter() as EventEmitter & {
      kill: ReturnType<typeof vi.fn>;
      once: (event: string, fn: () => void) => void;
      pid?: number;
    };
    child.kill = vi.fn();
    child.pid = pid;
    (child as any).once = (event: string, fn: () => void) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(fn);
      return child;
    };
    (child as any).__emit = (event: string) => {
      for (const fn of listeners[event] || []) fn();
    };
    (child as any).__listeners = listeners;
    return child;
  };

  it('sends SIGTERM via signalProcessTree and settles on the exit event', async () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild(4242);
      const onSettled = vi.fn();
      const groupKill = vi.spyOn(process, 'kill').mockImplementation(((
        pid: number,
        sig?: NodeJS.Signals,
      ) => {
        if (pid === -4242) return true;
        return process.kill(pid, sig);
      }) as any);

      terminatePrecheckProcess(child as any, onSettled);
      // signalProcessTree awaits a 100ms delay before the direct-kill belt
      await vi.advanceTimersByTimeAsync(150);

      // -pid signals the whole POSIX process group (launcher + workers)
      expect(groupKill).toHaveBeenCalledWith(-4242, 'SIGTERM');
      expect(child.kill).toHaveBeenCalledWith('SIGTERM');
      expect(onSettled).not.toHaveBeenCalled();

      (child as any).__emit('exit');
      expect(onSettled).toHaveBeenCalledTimes(1);
      // The SIGKILL escalation survives the launcher's exit (P2 4306440127);
      // only the hard fallback is cleared by settle. advanceTimersByTimeAsync
      // flushes the promise chain inside signalProcessTree so the direct-kill
      // belt (100ms after the group signal) lands before the assertion.
      await vi.advanceTimersByTimeAsync(2000);
      expect(onSettled).toHaveBeenCalledTimes(1);
      expect(groupKill).toHaveBeenCalledWith(-4242, 'SIGKILL');
      expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');
      groupKill.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the group SIGKILL escalation when the launcher exits early and a worker ignores SIGTERM (P2 4306440127)', async () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild(4242);
      const onSettled = vi.fn();
      const groupKill = vi.spyOn(process, 'kill').mockImplementation((() => true) as any);

      terminatePrecheckProcess(child as any, onSettled);
      await vi.advanceTimersByTimeAsync(150);
      // The launcher dies on the group SIGTERM before the grace period ends;
      // a worker descendant ignored the signal and is still alive.
      (child as any).__emit('exit');
      expect(onSettled).toHaveBeenCalledTimes(1);

      // The escalation must still fire after the grace period — settle no
      // longer cancels it, otherwise the ignoring worker leaks.
      await vi.advanceTimersByTimeAsync(600); // grace 500 + retry 100
      expect(groupKill).toHaveBeenCalledWith(-4242, 'SIGKILL');
      expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');
      expect(onSettled).toHaveBeenCalledTimes(1); // settled exactly once
      groupKill.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('escalates to a SIGKILL group signal after the grace period', async () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild(4242);
      const onSettled = vi.fn();
      const groupKill = vi.spyOn(process, 'kill').mockImplementation((() => true) as any);

      terminatePrecheckProcess(child as any, onSettled);
      await vi.advanceTimersByTimeAsync(600); // grace 500 + retry 100

      expect(groupKill).toHaveBeenCalledWith(-4242, 'SIGKILL');
      expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');

      // exit after escalation settles and clears the fallback timer
      (child as any).__emit('exit');
      expect(onSettled).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(2000);
      expect(onSettled).toHaveBeenCalledTimes(1);
      groupKill.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('falls back to a direct child kill when the process group is gone (ESRCH)', async () => {
    const child = makeFakeChild(9999);
    const onSettled = vi.fn();
    // No group exists for -9999: process.kill(-pid) throws ESRCH
    const groupKill = vi.spyOn(process, 'kill').mockImplementation(((pid: number) => {
      if (typeof pid === 'number' && pid < 0) {
        const e = new Error('no such process') as NodeJS.ErrnoException;
        e.code = 'ESRCH';
        throw e;
      }
      return true;
    }) as any);

    await signalProcessTree(child as any, 'SIGTERM');

    // group signal failed, but the direct child still got the signal
    expect(child.kill).toHaveBeenCalledWith('SIGTERM');
    expect(onSettled).not.toHaveBeenCalled();
    groupKill.mockRestore();
  });

  it('uses the direct kill path for children without a pid (mocked children)', async () => {
    const child = makeFakeChild(undefined);

    await signalProcessTree(child as any, 'SIGTERM');

    expect(child.kill).toHaveBeenCalledTimes(1);
    expect(child.kill).toHaveBeenCalledWith('SIGTERM');
  });

  it('settles via the hard fallback even when no exit event ever fires', async () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild(4242);
      const onSettled = vi.fn();
      const groupKill = vi.spyOn(process, 'kill').mockImplementation((() => true) as any);

      terminatePrecheckProcess(child as any, onSettled);
      await vi.advanceTimersByTimeAsync(1600); // SIGTERM round + SIGKILL round

      expect(onSettled).toHaveBeenCalledTimes(1);
      // SIGTERM (group+direct) + SIGKILL (group+direct)
      expect(child.kill).toHaveBeenCalledTimes(2);
      expect(groupKill).toHaveBeenCalledWith(-4242, 'SIGTERM');
      expect(groupKill).toHaveBeenCalledWith(-4242, 'SIGKILL');
      groupKill.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('settles only once across exit and fallback races', async () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild(4242);
      const onSettled = vi.fn();
      const groupKill = vi.spyOn(process, 'kill').mockImplementation((() => true) as any);

      terminatePrecheckProcess(child as any, onSettled);
      await vi.advanceTimersByTimeAsync(150);
      (child as any).__emit('exit');
      vi.advanceTimersByTime(2000);

      expect(onSettled).toHaveBeenCalledTimes(1);
      groupKill.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('reapOrphanedProcessGroup', () => {
  it('sends the initial group signal immediately and re-checks once', async () => {
    vi.useFakeTimers();
    try {
      const groupKill = vi.spyOn(process, 'kill').mockImplementation((() => true) as any);

      reapOrphanedProcessGroup(5555);

      expect(groupKill).toHaveBeenCalledWith(-5555, 'SIGKILL');

      await vi.advanceTimersByTimeAsync(500);
      expect(groupKill).toHaveBeenCalledTimes(2);
      expect(groupKill).toHaveBeenLastCalledWith(-5555, 'SIGKILL');
      groupKill.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not schedule a re-check when the group is already gone', async () => {
    vi.useFakeTimers();
    try {
      const groupKill = vi.spyOn(process, 'kill').mockImplementation(((pid: number) => {
        if (typeof pid === 'number' && pid < 0) {
          const e = new Error('no such process') as NodeJS.ErrnoException;
          e.code = 'ESRCH';
          throw e;
        }
        return true;
      }) as any);

      reapOrphanedProcessGroup(5555);

      await vi.advanceTimersByTimeAsync(1000);
      expect(groupKill).toHaveBeenCalledTimes(1); // initial probe only
      groupKill.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });

  it('logs and leaves alone a group it cannot signal (EPERM / setsid daemon)', async () => {
    vi.useFakeTimers();
    try {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const groupKill = vi.spyOn(process, 'kill').mockImplementation(((pid: number) => {
        if (typeof pid === 'number' && pid < 0) {
          const e = new Error('operation not permitted') as NodeJS.ErrnoException;
          e.code = 'EPERM';
          throw e;
        }
        return true;
      }) as any);

      reapOrphanedProcessGroup(6666);

      await vi.advanceTimersByTimeAsync(1000);
      expect(groupKill).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('EPERM'));
      groupKill.mockRestore();
      warn.mockRestore();
    } finally {
      vi.useRealTimers();
    }
  });
});
