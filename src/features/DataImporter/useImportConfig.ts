import { useCallback } from 'react';

import { ImportResults, configService } from '@/services/config';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const refreshSessions = useSessionStore((s) => s.refreshSessions);
  const [refreshMessages, refreshTopics] = useChatStore((s) => [s.refreshMessages, s.refreshTopic]);

  return useCallback(
    async (file: File) =>
      new Promise<ImportResults | undefined>((resolve) => {
        importConfigFile(file, async (config) => {
          const data = await configService.importConfigState(config);

          await refreshSessions();
          await refreshMessages();
          await refreshTopics();

          resolve(data);
        });
      }),
    [],
  );
};
