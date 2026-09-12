import type { CompletionSoundSettings } from '@lobechat/electron-client-ipc';

import { ensureElectronIpc } from '@/utils/electron/ipc';

class CompletionSoundService {
  private audio?: HTMLAudioElement;
  private playing?: Promise<void>;

  getSettings = () => ensureElectronIpc().completionSound.getSettings();

  setSettings = (settings: Partial<CompletionSoundSettings> & { reset?: boolean }) =>
    ensureElectronIpc().completionSound.setSettings(settings);

  importSound = () => ensureElectronIpc().completionSound.importSound();

  getNotificationSoundFile = () => ensureElectronIpc().completionSound.getNotificationSoundFile();

  /** Start audio once, even when several runs finish together. Resolves when playback starts. */
  play = async (options?: { preview?: boolean }): Promise<void> => {
    if (this.playing) return this.playing;
    if (this.audio && !this.audio.paused && !this.audio.ended) return;
    const start = async () => {
      const playback = await ensureElectronIpc().completionSound.getPlayback(options ?? {});
      if (!playback.play) return;
      this.audio = new Audio(playback.dataUrl ?? '/sounds/chat-complete.wav');
      this.audio.volume = playback.volume;
      await this.audio.play();
    };
    this.playing = start();
    try {
      await this.playing;
    } finally {
      this.playing = undefined;
    }
  };
}

export const completionSoundService = new CompletionSoundService();
