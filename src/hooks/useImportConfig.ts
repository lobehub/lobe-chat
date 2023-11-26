import { useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const importSessions = useSessionStore((s) => s.importSessions);
  const [importMessages, importTopics] = useChatStore((s) => [s.importMessages, s.importTopics]);
  const importAppSettings = useGlobalStore((s) => s.importAppSettings);

  const importConfig = (file: File) => {
    importConfigFile(file, (config) => {
      switch (config.exportType) {
        case 'settings': {
          importAppSettings(config.state.settings);
          break;
        }

        case 'agents': {
          importSessions(config.state.sessions);

          break;
        }
        case 'sessions': {
          importSessions(config.state.sessions);
          importMessages(config.state.messages);
          importTopics(config.state.topics);
          break;
        }

        case 'all': {
          importSessions(config.state.sessions);
          importMessages(config.state.messages);
          importTopics(config.state.topics);

          importAppSettings(config.state.settings);

          break;
        }
      }
    });
  };

  return useMemo(() => ({ importConfig }), []);
};
