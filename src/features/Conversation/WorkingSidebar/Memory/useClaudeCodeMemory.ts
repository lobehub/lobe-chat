import { isDesktop } from '@lobechat/const';

import { useClientDataSWR } from '@/libs/swr';
import { localFileKeys } from '@/libs/swr/keys';
import { claudeCodeMemoryService } from '@/services/claudeCodeMemory';

/**
 * Claude Code's auto memory for `workingDirectory`, read from the execution
 * device: Electron IPC on this desktop, the device RPC for a bound device.
 * Inert until there is a directory and a transport. An offline device (`null`
 * from the RPC) surfaces as an error, never as "no memory".
 */
export const useClaudeCodeMemory = (deviceId: string | undefined, workingDirectory?: string) => {
  const key =
    workingDirectory && (deviceId || isDesktop)
      ? localFileKeys.claudeCodeMemory(deviceId, workingDirectory)
      : null;

  return useClientDataSWR(
    key,
    async () => {
      const result = await claudeCodeMemoryService.listMemory({
        deviceId,
        workingDirectory: workingDirectory!,
      });
      if (!result) throw new Error('The device did not return Claude Code memory');
      return result;
    },
    // Claude Code writes memory between turns, and the user edits it in the
    // portal, so a refocus re-reads the directory instead of waiting minutes.
    { focusThrottleInterval: 5 * 1000, revalidateOnFocus: true, shouldRetryOnError: false },
  );
};
