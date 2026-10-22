import type { DeviceListClaudeCodeMemoryResult } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';
import { ensureElectronIpc } from '@/utils/electron/ipc';

/**
 * Claude Code auto-memory chokepoint. A bound device answers over the
 * `device.listClaudeCodeMemory` RPC; the local desktop scans over Electron IPC.
 * (Parallels `projectSkillService`.)
 */
class ClaudeCodeMemoryService {
  /** Memory files under `~/.claude/projects/<project key>/memory` for `workingDirectory`. */
  async listMemory({
    deviceId,
    workingDirectory,
  }: {
    deviceId?: string;
    workingDirectory: string;
  }): Promise<DeviceListClaudeCodeMemoryResult | null> {
    return deviceId
      ? lambdaClient.device.listClaudeCodeMemory.query({ deviceId, workingDirectory })
      : ensureElectronIpc().workspace.listClaudeCodeMemory({ scope: workingDirectory });
  }
}

export const claudeCodeMemoryService = new ClaudeCodeMemoryService();
