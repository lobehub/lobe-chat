import { describe, expect, it, vi } from 'vitest';

import { LiveTranscriber } from './liveTranscriber';
import type { LiveWindow } from './liveWindows';

const window = (startMs: number, voiced = true): LiveWindow => ({
  endMs: startMs + 1000,
  frames: [],
  startMs,
  voiced,
});

const setup = (transcribe: (window: LiveWindow) => Promise<string>) => {
  const onSegment = vi.fn();
  const onStatus = vi.fn();
  const transcriber = new LiveTranscriber({
    onSegment,
    onStatus,
    transcribe,
    wait: () => Promise.resolve(),
  });
  return { onSegment, onStatus, transcriber };
};

describe('LiveTranscriber', () => {
  it('emits segments in recording order with sequential seq, even when requests finish out of order', async () => {
    const { onSegment, transcriber } = setup(async (w) => {
      // The first window is the slowest; order must still follow the recording.
      await new Promise((resolve) => setTimeout(resolve, w.startMs === 0 ? 20 : 0));
      return `text at ${w.startMs}`;
    });

    transcriber.enqueue(window(0));
    transcriber.enqueue(window(1000));
    transcriber.enqueue(window(2000));
    await transcriber.drain(1000);

    expect(onSegment.mock.calls.map(([segment]) => segment)).toEqual([
      { endMs: 1000, seq: 0, startMs: 0, text: 'text at 0' },
      { endMs: 2000, seq: 1, startMs: 1000, text: 'text at 1000' },
      { endMs: 3000, seq: 2, startMs: 2000, text: 'text at 2000' },
    ]);
  });

  it('skips silent windows and blank results without a request or a segment', async () => {
    const transcribe = vi.fn(async () => '   ');
    const { onSegment, transcriber } = setup(transcribe);

    transcriber.enqueue(window(0, false));
    transcriber.enqueue(undefined);
    transcriber.enqueue(window(1000));
    await transcriber.drain(1000);

    expect(transcribe).toHaveBeenCalledTimes(1);
    expect(onSegment).not.toHaveBeenCalled();
  });

  it('retries a failed window and recovers without losing its text', async () => {
    const transcribe = vi
      .fn<(w: LiveWindow) => Promise<string>>()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce('recovered');
    const { onSegment, transcriber } = setup(transcribe);

    transcriber.enqueue(window(0));
    await transcriber.drain(1000);

    expect(transcribe).toHaveBeenCalledTimes(2);
    expect(onSegment).toHaveBeenCalledWith(expect.objectContaining({ text: 'recovered' }));
  });

  it('reports lagging after the last retry, then live again once a window succeeds', async () => {
    const transcribe = vi.fn<(w: LiveWindow) => Promise<string>>(async (w) => {
      if (w.startMs === 0) throw new Error('down');
      return 'back';
    });
    const { onStatus, transcriber } = setup(transcribe);

    transcriber.enqueue(window(0));
    await transcriber.drain(1000);
    expect(onStatus).toHaveBeenLastCalledWith({ pendingWindows: 0, state: 'lagging' });
    // 1 attempt + 3 retries
    expect(transcribe).toHaveBeenCalledTimes(4);

    transcriber.enqueue(window(1000));
    await transcriber.drain(1000);
    expect(onStatus).toHaveBeenLastCalledWith({ pendingWindows: 0, state: 'live' });
  });

  it('gives up waiting at the drain timeout', async () => {
    const { transcriber } = setup(() => new Promise<string>(() => undefined));
    transcriber.enqueue(window(0));

    await expect(transcriber.drain(10)).resolves.toBe(false);
  });
});
