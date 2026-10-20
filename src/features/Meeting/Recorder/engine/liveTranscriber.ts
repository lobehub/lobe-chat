import type { LiveSegment, LiveTranscriptState } from '@/store/meeting';

import type { LiveWindow } from './liveWindows';

export interface LiveTranscriberDeps {
  onSegment: (segment: LiveSegment) => void;
  onStatus: (status: { pendingWindows: number; state: LiveTranscriptState }) => void;
  /** Turn one window into text; throws when the request failed. */
  transcribe: (window: LiveWindow) => Promise<string>;
  /** Back-off before retry `attempt` (1-based); injectable for tests. */
  wait?: (ms: number) => Promise<void>;
}

const RETRY_DELAYS_MS = [1000, 2000, 4000];

const defaultWait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Transcribes windows one at a time, in recording order, so segments arrive
 * in the order they were spoken. A failed window is retried with back-off;
 * after the last retry it is skipped and the state reads `lagging` until the
 * next window succeeds. Recording itself never waits on this queue.
 */
export class LiveTranscriber {
  readonly #deps: LiveTranscriberDeps;
  readonly #queue: LiveWindow[] = [];
  #disposed = false;
  #idle: Promise<void> = Promise.resolve();
  #running = false;
  #seq = 0;
  #state: LiveTranscriptState = 'live';

  constructor(deps: LiveTranscriberDeps) {
    this.#deps = deps;
  }

  enqueue(window: LiveWindow | undefined) {
    if (!window || !window.voiced || this.#disposed) return;

    this.#queue.push(window);
    this.#report();
    if (!this.#running) this.#idle = this.#run();
  }

  /** Wait until every queued window is transcribed, at most `timeoutMs`. */
  async drain(timeoutMs: number): Promise<boolean> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), timeoutMs);
    });
    const done = this.#idle.then(() => true as const);
    const result = await Promise.race([done, timeout]);
    clearTimeout(timer);
    return result;
  }

  dispose() {
    this.#disposed = true;
    this.#queue.length = 0;
  }

  async #run() {
    this.#running = true;
    while (this.#queue.length > 0 && !this.#disposed) {
      const window = this.#queue[0];
      const text = await this.#transcribeWithRetry(window);
      this.#queue.shift();

      if (text === undefined) {
        this.#state = 'lagging';
      } else {
        this.#state = 'live';
        const trimmed = text.trim();
        if (trimmed && !this.#disposed) {
          this.#deps.onSegment({
            endMs: window.endMs,
            seq: this.#seq++,
            startMs: window.startMs,
            text: trimmed,
          });
        }
      }
      this.#report();
    }
    this.#running = false;
  }

  async #transcribeWithRetry(window: LiveWindow): Promise<string | undefined> {
    const wait = this.#deps.wait ?? defaultWait;

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      if (this.#disposed) return undefined;
      try {
        return await this.#deps.transcribe(window);
      } catch (error) {
        console.warn('[meeting:live] window transcription failed', error);
        if (attempt === RETRY_DELAYS_MS.length) return undefined;
        await wait(RETRY_DELAYS_MS[attempt]);
      }
    }
    return undefined;
  }

  #report() {
    this.#deps.onStatus({ pendingWindows: this.#queue.length, state: this.#state });
  }
}
