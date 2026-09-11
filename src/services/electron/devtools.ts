import type { AppProcessMetrics, GpuStatus, MemoryDump } from '@lobechat/electron-client-ipc';

import { ensureElectronIpc } from '@/utils/electron/ipc';

class DevtoolsService {
  async openDevtools(): Promise<void> {
    return ensureElectronIpc().devtools.openDevtools();
  }

  async getAppProcessMetrics(): Promise<AppProcessMetrics> {
    return ensureElectronIpc().devtools.getAppProcessMetrics();
  }

  async captureMemoryDump(): Promise<MemoryDump> {
    return ensureElectronIpc().devtools.captureMemoryDump();
  }

  async getGpuStatus(): Promise<GpuStatus> {
    return ensureElectronIpc().devtools.getGpuStatus();
  }
}

export const electronDevtoolsService = new DevtoolsService();
