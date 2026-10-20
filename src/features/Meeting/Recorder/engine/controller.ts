import type { MeetingPlatform, MeetingRealtimeProvider } from '@lobechat/types';

import type {
  LiveSegment,
  MeetingRecorderState,
  MicrophoneDevice,
  MicrophonePermission,
  RecorderErrorCode,
} from '@/store/meeting';

import { LevelMeter } from './levelMeter';
import { LiveTranscriber } from './liveTranscriber';
import { frameLevel, type LiveWindow, LiveWindowCutter } from './liveWindows';

/** PCM capture of the microphone stream: 200 ms frames of 16 kHz mono PCM16. */
export interface FrameCapture {
  cancel: () => Promise<void>;
  start: (onFrame: (frame: ArrayBuffer) => void, onError: () => void) => Promise<void>;
  stop: () => Promise<void>;
}

/** The slice of `MediaRecorder` the controller drives, so tests can fake it. */
export interface AudioRecorder {
  pause: () => void;
  resume: () => void;
  start: () => void;
  /** Stop and resolve with the whole recording. */
  stop: () => Promise<Blob>;
}

export interface MeetingRecorderDeps {
  api: {
    appendRealtimeSegments: (meetingId: string, segments: LiveSegment[]) => Promise<unknown>;
    attachAudio: (meetingId: string, fileId: string) => Promise<unknown>;
    create: (params: {
      platform: MeetingPlatform;
      realtimeProvider: MeetingRealtimeProvider;
      refineProvider: 'cloud';
      title: string;
    }) => Promise<{ id: string } | undefined>;
    finish: (meetingId: string, durationMs: number) => Promise<unknown>;
    pause: (meetingId: string) => Promise<unknown>;
    /** Post-recording pass: full transcript with speakers, then the minutes. */
    refine: (meetingId: string) => Promise<unknown>;
    resume: (meetingId: string) => Promise<unknown>;
  };
  createAudioRecorder: (stream: MediaStream) => AudioRecorder;
  createCapture: (stream: MediaStream) => Promise<FrameCapture>;
  frameMs: number;
  getUserMedia: (deviceId?: string) => Promise<MediaStream>;
  /** Live transcription for one window, or `undefined` when no model is configured. */
  liveTranscribe: () => ((window: LiveWindow) => Promise<string>) | undefined;
  platform: MeetingPlatform;
  /** Fire-and-forget refresh of the meetings list after a meeting changes. */
  refreshMeetings: () => void;
  store: {
    getRecorder: () => MeetingRecorderState;
    getSelectedDeviceId: () => string | undefined;
    patchRecorder: (patch: Partial<MeetingRecorderState>, action?: string) => void;
    setDevices: (devices: MicrophoneDevice[]) => void;
    setPermission: (permission: MicrophonePermission) => void;
  };
  uploadRecording: (file: File) => Promise<string>;
}

/** How long a stop waits for the live transcript to catch up before saving. */
const DRAIN_TIMEOUT_MS = 20_000;

export const mapMicrophoneError = (error: unknown): RecorderErrorCode => {
  const name = (error as { name?: string } | undefined)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'permission_denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no_device';
  if ((error as Error | undefined)?.message === 'microphone_not_supported') return 'not_supported';
  return 'not_supported';
};

const recordingExtension = (mimeType: string) =>
  mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';

/**
 * The app-wide meeting recorder. One instance lives for the whole SPA, so a
 * recording keeps going while the user moves between pages; components only
 * read the store and call these methods.
 */
export class MeetingRecorderController {
  readonly levels = new LevelMeter();
  readonly #deps: MeetingRecorderDeps;
  #audio?: AudioRecorder;
  #capture?: FrameCapture;
  #cutter?: LiveWindowCutter;
  /** Recording kept after a failed upload, so `retryUpload` can send it again. */
  #pendingUpload?: File;
  #segments: LiveSegment[] = [];
  #transcriber?: LiveTranscriber;

  constructor(deps: MeetingRecorderDeps) {
    this.#deps = deps;
  }

  get #recorder() {
    return this.#deps.store.getRecorder();
  }

  #patch(patch: Partial<MeetingRecorderState>, action: string) {
    this.#deps.store.patchRecorder(patch, action);
  }

  /** List microphones; labels only appear once the user has granted access. */
  async refreshDevices(enumerate: () => Promise<MediaDeviceInfo[]>) {
    try {
      const devices = await enumerate();
      this.#deps.store.setDevices(
        devices
          .filter((device) => device.kind === 'audioinput' && device.deviceId !== 'default')
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${index + 1}`,
          })),
      );
    } catch (error) {
      console.warn('[meeting:recorder] cannot list microphones', error);
    }
  }

  async start({ title }: { title: string }) {
    const { phase } = this.#recorder;
    if (phase !== 'idle' && phase !== 'done') return;

    this.levels.reset();
    this.#segments = [];
    this.#pendingUpload = undefined;
    this.#patch(
      {
        durationMs: 0,
        error: undefined,
        live: 'live',
        meetingId: undefined,
        pendingWindows: 0,
        phase: 'requesting_permission',
        segments: [],
        title,
      },
      'start/requestPermission',
    );

    let stream: MediaStream;
    try {
      stream = await this.#deps.getUserMedia(this.#deps.store.getSelectedDeviceId());
    } catch (error) {
      const code = mapMicrophoneError(error);
      if (code === 'permission_denied') this.#deps.store.setPermission('denied');
      this.#patch({ error: code, phase: 'idle' }, 'start/microphoneFailed');
      return;
    }
    this.#deps.store.setPermission('granted');

    let capture: FrameCapture;
    try {
      capture = await this.#deps.createCapture(stream);
    } catch (error) {
      console.error('[meeting:recorder] audio capture unavailable', error);
      for (const track of stream.getTracks()) track.stop();
      this.#patch({ error: 'not_supported', phase: 'idle' }, 'start/captureFailed');
      return;
    }

    const transcribe = this.#deps.liveTranscribe();
    let meetingId: string | undefined;
    try {
      const meeting = await this.#deps.api.create({
        platform: this.#deps.platform,
        realtimeProvider: transcribe ? 'cloud' : 'none',
        refineProvider: 'cloud',
        title,
      });
      meetingId = meeting?.id;
    } catch (error) {
      console.error('[meeting:recorder] cannot create meeting', error);
    }
    if (!meetingId) {
      await capture.cancel();
      this.#patch({ error: 'start_failed', phase: 'idle' }, 'start/createFailed');
      return;
    }

    this.#capture = capture;
    this.#cutter = new LiveWindowCutter({ frameMs: this.#deps.frameMs });
    this.#transcriber = transcribe ? this.#createTranscriber(meetingId, transcribe) : undefined;
    this.#audio = this.#deps.createAudioRecorder(stream);
    this.#audio.start();

    this.#patch(
      { live: transcribe ? 'live' : 'unavailable', meetingId, phase: 'recording' },
      'start/recording',
    );
    this.#deps.refreshMeetings();

    await capture.start(
      (frame) => this.#onFrame(frame),
      () => void this.pause(),
    );
  }

  async pause() {
    const { meetingId, phase } = this.#recorder;
    if (phase !== 'recording' || !meetingId) return;

    this.#audio?.pause();
    this.#transcriber?.enqueue(this.#cutter?.flush());
    this.levels.reset();
    this.#patch({ phase: 'paused' }, 'pause');
    await this.#deps.api.pause(meetingId).catch((error) => {
      console.warn('[meeting:recorder] pause not saved', error);
    });
  }

  async resume() {
    const { meetingId, phase } = this.#recorder;
    if (phase !== 'paused' || !meetingId) return;

    this.#audio?.resume();
    this.#patch({ phase: 'recording' }, 'resume');
    await this.#deps.api.resume(meetingId).catch((error) => {
      console.warn('[meeting:recorder] resume not saved', error);
    });
  }

  async stop() {
    const { durationMs, meetingId, phase, title } = this.#recorder;
    if ((phase !== 'recording' && phase !== 'paused') || !meetingId) return;

    this.#patch({ phase: 'finishing' }, 'stop/finishing');
    this.levels.reset();

    // Stop the recorder before the capture: closing the capture ends the
    // stream's tracks, which would end the recording without its last chunk.
    const blob = await this.#audio?.stop().catch((error) => {
      console.error('[meeting:recorder] recording could not be finalized', error);
      return undefined;
    });
    await this.#capture?.stop().catch(() => undefined);
    this.#transcriber?.enqueue(this.#cutter?.flush());
    await this.#transcriber?.drain(DRAIN_TIMEOUT_MS);
    this.#transcriber?.dispose();
    this.#capture = undefined;
    this.#audio = undefined;
    this.#cutter = undefined;
    this.#transcriber = undefined;

    await this.#deps.api.finish(meetingId, durationMs).catch((error) => {
      console.error('[meeting:recorder] finish not saved', error);
    });

    if (blob && blob.size > 0) {
      const extension = recordingExtension(blob.type);
      this.#pendingUpload = new File([blob], `${title || meetingId}.${extension}`, {
        type: blob.type || 'audio/webm',
      });
      await this.#upload(meetingId);
    } else {
      this.#patch({ phase: 'done' }, 'stop/noAudio');
    }

    this.#deps.refreshMeetings();
  }

  /** Send the kept recording again after `upload_failed`. */
  async retryUpload() {
    const { error, meetingId } = this.#recorder;
    if (error !== 'upload_failed' || !meetingId || !this.#pendingUpload) return;

    this.#patch({ error: undefined, phase: 'finishing' }, 'retryUpload');
    await this.#upload(meetingId);
    this.#deps.refreshMeetings();
  }

  async #upload(meetingId: string) {
    const file = this.#pendingUpload;
    if (!file) return;

    try {
      const fileId = await this.#deps.uploadRecording(file);
      await this.#deps.api.attachAudio(meetingId, fileId);
      this.#pendingUpload = undefined;
      this.#patch({ error: undefined, phase: 'done' }, 'stop/uploaded');
      // Runs on the server for minutes; the meeting page follows its status, so nothing waits here.
      void this.#deps.api
        .refine(meetingId)
        .catch((error) => console.error('[meeting:recorder] refine not started', error))
        .finally(() => this.#deps.refreshMeetings());
    } catch (error) {
      console.error('[meeting:recorder] audio upload failed', error);
      this.#patch({ error: 'upload_failed', phase: 'done' }, 'stop/uploadFailed');
    }
  }

  #onFrame(frame: ArrayBuffer) {
    if (this.#recorder.phase !== 'recording') return;

    const level = frameLevel(frame);
    this.levels.push(level);
    this.#transcriber?.enqueue(this.#cutter?.push(frame, level));
    this.#patch({ durationMs: this.#recorder.durationMs + this.#deps.frameMs }, 'frame');
  }

  #createTranscriber(meetingId: string, transcribe: (window: LiveWindow) => Promise<string>) {
    return new LiveTranscriber({
      onSegment: (segment) => {
        this.#segments = [...this.#segments, segment];
        this.#patch({ segments: this.#segments }, 'live/segment');
        void this.#deps.api.appendRealtimeSegments(meetingId, [segment]).catch((error) => {
          console.warn('[meeting:recorder] live segment not saved', error);
        });
      },
      onStatus: ({ pendingWindows, state }) => {
        this.#patch({ live: state, pendingWindows }, 'live/status');
      },
      transcribe,
    });
  }
}
