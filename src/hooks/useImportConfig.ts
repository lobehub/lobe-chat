import { useMemo } from 'react';

import { ImportResults, configService } from '@/services/config';
import { shareService } from '@/services/share';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const refreshSessions = useSessionStore((s) => s.refreshSessions);
  const [refreshMessages, refreshTopics] = useChatStore((s) => [s.refreshMessages, s.refreshTopic]);
  const [setSettings] = useUserStore((s) => [s.setSettings]);

  const importConfig = async (file: File) =>
    new Promise<ImportResults | undefined>((resolve) => {
      importConfigFile(file, async (config) => {
        const data = await configService.importConfigState(config);

        await refreshSessions();
        await refreshMessages();
        await refreshTopics();

        resolve(data);
      });
    });

  /**
   * Import settings from a string in json format
   * @param settingsParams
   * @returns
   */
  const importSettings = (settingsParams: string | null) => {
    if (settingsParams) {
      const importSettings = shareService.decodeShareSettings(settingsParams);
      if (importSettings?.message || !importSettings?.data) {
        // handle some error
        return;
      }
      setSettings(importSettings.data);
    }
  };

  return useMemo(() => ({ importConfig, importSettings }), []);
};
