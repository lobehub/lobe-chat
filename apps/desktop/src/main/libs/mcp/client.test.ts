import { EventEmitter } from 'node:events';

import { describe, expect, it, vi } from 'vitest';

import {
  appendCappedOutput,
  buildInitializeProbeMessage,
  describeStdioSpawnFailure,
  hasInitializeResponse,
  MCPClient,
  MCPConnectionError,
  selectDiagnosticOutputLines,
  terminatePrecheckProcess,
} from './client';

describe('describeStdioSpawnFailure', () => {
  it('diagnoses ENOENT spawn errors with the command and install guidance', () => {
    const message = describeStdioSpawnFailure({
      command: 'kali-mcp',
      spawnCode: 'ENOENT',
    });

    expect(message).toContain('kali-mcp');
    expect(message).toContain('not found');
    expect(message).toContain('npx`/`.cmd`');
  });

  it('maps Windows numeric errno -4058 (ENOENT) to the not-found diagnosis', () => {
    // Windows spawn failures surface as a numeric errno without a symbolic code
    const message = describeStdioSpawnFailure({
      command: 'goatjg_mcp',
      errno: -4058,
    });

    expect(message).toContain('goatjg_mcp');
    expect(message).toContain('not found');
  });

  it('diagnoses permission errors', () => {
    const message = describeStdioSpawnFailure({
      command: '/usr/local/bin/kali-server',
      spawnCode: 'EACCES',
    });

    expect(message).toContain('not executable');
    expect(message).toContain('chmod +x');
  });

  it('detects the pt-BR "path not found" loader message from the real vent', () => {
    // Real-world stderr from vent msg_PjF7YECkH0nA67ddyY (Windows, pt-BR locale)
    const message = describeStdioSpawnFailure({
      command: 'mcpkali_note',
      exitCode: 1,
      stderr: 'O sistema não pode encontrar o caminho especificado.',
    });

    expect(message).toContain('mcpkali_note');
    expect(message).toContain('path not found');
    expect(message).toContain('Reinstall');
  });

  it('detects the zh-CN loader message', () => {
    const message = describeStdioSpawnFailure({
      command: 'kali_mcp',
      exitCode: 1,
      stderr: '系统找不到指定的路径。',
    });

    expect(message).toContain('path not found');
  });

  it('falls back to the exit-code diagnosis for unrelated stderr', () => {
    const message = describeStdioSpawnFailure({
      command: 'broken-server',
      exitCode: 127,
      stderr: 'some unrelated crash output',
    });

    expect(message).toContain('exited immediately with code 127');
  });

  it('diagnoses a zero-code exit without MCP handshake as a startup failure', () => {
    const message = describeStdioSpawnFailure({
      command: 'one-shot-wrapper',
      exitCode: 0,
      stdout: 'starting up',
    });

    expect(message).toContain('exited (code 0)');
    expect(message).toContain('without completing the MCP handshake');
  });

  it('diagnoses a zero-code exit with an error line printed on stdout', () => {
    const message = describeStdioSpawnFailure({
      command: 'kali-wrapper',
      exitCode: 0,
      stdout: 'Error: config file missing',
    });

    expect(message).toContain('exited (code 0)');
    expect(message).toContain('kali-wrapper');
  });

  it('reports the crash signal for signal-only exits (exitCode null)', () => {
    // Node sets exitCode === null and populates `signal` when killed by one
    const message = describeStdioSpawnFailure({
      command: 'segfaulting-server',
      exitCode: null,
      signal: 'SIGSEGV',
    });

    expect(message).toContain('segfaulting-server');
    expect(message).toContain('terminated by signal SIGSEGV');
    expect(message).not.toContain('not found');
  });

  it('reports a signal crash with no output distinctly', () => {
    const message = describeStdioSpawnFailure({
      command: 'aborting-server',
      exitCode: null,
      signal: 'SIGABRT',
    });

    expect(message).toContain('terminated by signal SIGABRT');
    expect(message).toContain('no output');
  });

  it('detects the pt-BR "path not found" loader message printed on stdout', () => {
    // Some launchers print the loader error on stdout instead of stderr
    const message = describeStdioSpawnFailure({
      command: 'mcpkali_note',
      exitCode: 1,
      stderr: '',
      stdout: 'O sistema não pode encontrar o caminho especificado.',
    });

    expect(message).toContain('mcpkali_note');
    expect(message).toContain('path not found');
    expect(message).toContain('Reinstall');
  });

  it('falls back to the no-output diagnosis when nothing is captured', () => {
    const message = describeStdioSpawnFailure({ command: 'silent-server' });

    expect(message).toContain('produced no output');
    expect(message).toContain('silent-server');
  });
});

describe('MCPConnectionError', () => {
  it('carries stderr logs and a stable name for the existing enhancer pipeline', () => {
    const error = new MCPConnectionError('diagnosis text', ['line one', 'line two']);

    expect(error.name).toBe('MCPConnectionError');
    expect(error.message).toBe('diagnosis text');
    expect(error.stderrLogs).toEqual(['line one', 'line two']);
  });
});

describe('appendCappedOutput', () => {
  it('accumulates chunks below the cap without truncation', () => {
    const first = appendCappedOutput('', Buffer.from('hello '));
    const second = appendCappedOutput(first.text, Buffer.from('world'));

    expect(second.text).toBe('hello world');
    expect(second.truncated).toBe(false);
  });

  it('drops data beyond the per-stream cap instead of buffering it', () => {
    // 64 KiB cap: fill the accumulator, then push more data
    const filler = 'x'.repeat(64 * 1024);
    const full = appendCappedOutput('', Buffer.from(filler));
    expect(full.truncated).toBe(false);

    const over = appendCappedOutput(full.text, Buffer.from('overflow-data'));
    expect(over.truncated).toBe(true);
    expect(Buffer.byteLength(over.text)).toBe(64 * 1024);
    expect(over.text).not.toContain('overflow-data');
  });

  it('truncates a single oversized chunk at the byte boundary', () => {
    const chunk = Buffer.from('y'.repeat(200 * 1024));
    const result = appendCappedOutput('', chunk);

    expect(result.truncated).toBe(true);
    expect(Buffer.byteLength(result.text)).toBe(64 * 1024);
  });

  it('keeps dropping once the cap is already reached', () => {
    const filler = 'x'.repeat(64 * 1024);
    let state = appendCappedOutput('', Buffer.from(filler));
    state = appendCappedOutput(state.text, Buffer.from('more'));
    state = appendCappedOutput(state.text, Buffer.from('even more'));

    expect(state.truncated).toBe(true);
    expect(Buffer.byteLength(state.text)).toBe(64 * 1024);
  });
});

describe('buildInitializeProbeMessage', () => {
  it('includes capabilities so spec-validating servers accept the probe', () => {
    const message = buildInitializeProbeMessage();
    const parsed = JSON.parse(message);

    expect(parsed.params.capabilities).toEqual({});
    expect(parsed.params.protocolVersion).toBe('2024-11-05');
    expect(parsed.params.clientInfo.name).toBe('lobe-mcp-precheck');
    expect(message.endsWith('\n')).toBe(true);
  });
});

describe('selectDiagnosticOutputLines', () => {
  const makeLines = (n: number, prefix: string) =>
    Array.from({ length: n }, (_, i) => `${prefix} line ${i + 1}`).join('\n');

  it('keeps the tail of each stream and caps at 10 lines per stream', () => {
    const stdout = makeLines(15, 'out');
    const stderr = makeLines(15, 'err');

    const lines = selectDiagnosticOutputLines(stdout, stderr);

    expect(lines).toHaveLength(20);
    expect(lines[0]).toBe('out line 6');
    expect(lines[9]).toBe('out line 15');
    expect(lines[10]).toBe('err line 6');
    expect(lines[19]).toBe('err line 15');
  });

  it('merges stdout then stderr preserving order', () => {
    const lines = selectDiagnosticOutputLines('out-1\nout-2', 'err-1');

    expect(lines).toEqual(['out-1', 'out-2', 'err-1']);
  });

  it('returns an empty array when both streams are empty', () => {
    expect(selectDiagnosticOutputLines('', '')).toEqual([]);
  });
});

describe('hasInitializeResponse', () => {
  it('detects a JSON-RPC response to the initialize probe (id 1)', () => {
    const stdout = [
      'server starting…',
      JSON.stringify({ id: 1, jsonrpc: '2.0', result: { protocolVersion: '2024-11-05' } }),
    ].join('\n');

    expect(hasInitializeResponse(stdout)).toBe(true);
  });

  it('returns false when stdout has chatter but no probe response', () => {
    expect(hasInitializeResponse('booting\nready-ish\n')).toBe(false);
  });

  it('ignores notifications (no id) and other ids', () => {
    const stdout = [
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
      JSON.stringify({ id: 2, jsonrpc: '2.0', result: {} }),
    ].join('\n');

    expect(hasInitializeResponse(stdout)).toBe(false);
  });
});

describe('terminatePrecheckProcess', () => {
  const makeFakeChild = () => {
    const listeners: Record<string, (() => void)[]> = {};
    const child = new EventEmitter() as EventEmitter & {
      kill: ReturnType<typeof vi.fn>;
      once: (event: string, fn: () => void) => void;
    };
    child.kill = vi.fn();
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

  it('sends SIGTERM first and settles on the exit event', () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild();
      const onSettled = vi.fn();

      terminatePrecheckProcess(child as any, onSettled);

      expect(child.kill).toHaveBeenCalledWith('SIGTERM');
      expect(onSettled).not.toHaveBeenCalled();

      (child as any).__emit('exit');
      expect(onSettled).toHaveBeenCalledTimes(1);
      // timers cleared: no SIGKILL, no fallback
      vi.advanceTimersByTime(2000);
      expect(child.kill).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('escalates to SIGKILL after the grace period when the process ignores SIGTERM', () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild();
      const onSettled = vi.fn();

      terminatePrecheckProcess(child as any, onSettled);
      vi.advanceTimersByTime(500);

      expect(child.kill).toHaveBeenNthCalledWith(2, 'SIGKILL');

      // exit after escalation settles and clears the fallback timer
      (child as any).__emit('exit');
      expect(onSettled).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(2000);
      expect(onSettled).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('settles via the hard fallback even when no exit event ever fires', () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild();
      const onSettled = vi.fn();

      terminatePrecheckProcess(child as any, onSettled);
      vi.advanceTimersByTime(1500);

      expect(onSettled).toHaveBeenCalledTimes(1);
      expect(child.kill).toHaveBeenCalledTimes(2); // SIGTERM + SIGKILL
    } finally {
      vi.useRealTimers();
    }
  });

  it('settles only once across exit and fallback races', () => {
    vi.useFakeTimers();
    try {
      const child = makeFakeChild();
      const onSettled = vi.fn();

      terminatePrecheckProcess(child as any, onSettled);
      (child as any).__emit('exit');
      vi.advanceTimersByTime(2000);

      expect(onSettled).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('preCheckStdioCommand', () => {
  /**
   * Call the private pre-check directly with a short timeout so long-running
   * server cases do not stall the suite.
   */
  const runPreCheck = (
    command: string,
    args?: string[],
    timeoutMs = 1200,
  ): Promise<{ diagnosis: string; stderr: string; stdout: string; success: boolean }> =>
    (
      MCPClient.prototype as unknown as {
        preCheckStdioCommand: (p: {
          args?: string[];
          command: string;
          env?: Record<string, string>;
          timeoutMs?: number;
        }) => Promise<{ diagnosis: string; stderr: string; stdout: string; success: boolean }>;
      }
    ).preCheckStdioCommand.call({} as MCPClient, { args, command, env: {}, timeoutMs });

  it(
    'classifies on close so buffered stdout is drained before the diagnosis (P2 4305387427)',
    { timeout: 15_000 },
    async () => {
      // The child prints its error line and exits 0 immediately; Node may
      // emit `exit` before the stdout chunk drains — classification must
      // wait for `close` (or the bounded fallback) to see it.
      const result = await runPreCheck('node', [
        '-e',
        'process.stdout.write("final loader error\\n"); process.exit(0)',
      ]);

      expect(result.success).toBe(false);
      expect(result.diagnosis).toContain('without completing the MCP handshake');
      expect(result.stdout).toContain('final loader error');
    },
  );

  it(
    'does not credit exit 0 without an initialize response (round-4 regression guard)',
    { timeout: 15_000 },
    async () => {
      const result = await runPreCheck('node', ['-e', 'process.exit(0)']);

      expect(result.success).toBe(false);
      expect(result.diagnosis).toContain('without completing the MCP handshake');
    },
  );

  it(
    'classifies zero-code exits even when close is delayed by inherited pipes (exit fallback)',
    { timeout: 15_000 },
    async () => {
      // The child spawns a detached grandchild holding stdout open, then
      // exits 0. `close` stays pending on the inherited pipe; the exit-armed
      // fallback must classify with the real exit code before the 5s timeout
      // would have misreported "healthy-enough".
      const result = await runPreCheck('node', [
        '-e',
        [
          'const { spawn } = require("node:child_process");',
          'const g = spawn(process.execPath, ["-e", "setTimeout(() => {}, 3000)"], { stdio: ["ignore", "inherit", "inherit"], detached: false });',
          'g.unref();',
          'process.exit(0);',
        ].join(' '),
      ]);

      expect(result.success).toBe(false);
      expect(result.diagnosis).toContain('without completing the MCP handshake');
    },
  );

  it(
    'treats a long-running silent server as healthy via the timeout path (success preserved)',
    { timeout: 15_000 },
    async () => {
      const result = await runPreCheck(
        'node',
        ['-e', 'setInterval(() => {}, 1000)'],
        800, // short pre-check window: the server outlives it
      );

      expect(result.success).toBe(true);
      expect(result.diagnosis).toBe('');
    },
  );

  it('reports a nonzero exit with its code after streams drain', { timeout: 15_000 }, async () => {
    const result = await runPreCheck('node', [
      '-e',
      'process.stderr.write("boom\\n"); process.exit(3)',
    ]);

    expect(result.success).toBe(false);
    expect(result.diagnosis).toContain('code 3');
  });
});
