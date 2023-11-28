import { useMemo } from 'react';

import { configService } from '@/services/config';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const refreshSessions = useSessionStore((s) => s.refreshSessions);
  const [refreshMessages, refreshTopics] = useChatStore((s) => [s.refreshMessages, s.refreshTopic]);

  const importConfig = (file: File) => {
    importConfigFile(file, async (config) => {
      await configService.importConfigState(config);

      refreshSessions();
      refreshMessages();
      refreshTopics();
    });
  };

  return useMemo(() => ({ importConfig }), []);
};
