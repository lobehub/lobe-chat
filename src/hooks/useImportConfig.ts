import { produce } from 'immer';
import { useMemo } from 'react';

import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { LobeAgentSession } from '@/types/session';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const importSessions = useSessionStore((s) => s.importSessions);
  const importAppSettings = useGlobalStore((s) => s.importAppSettings);

  const importConfig = (file: File) => {
    importConfigFile(file, (config) => {
      const importSessionMap = (sessions: Record<string, LobeAgentSession>) => {
        const newSessions = [];
        for (const s of Object.values(sessions)) {
          newSessions.push(
            produce(s, (draft) => {
              draft.topics = [];
              draft.createdAt = draft.createAt;
              draft.updatedAt = draft.updateAt;
              draft.group = draft.pinned ? 'pinned' : 'default';
            }),
          );
        }
        importSessions(newSessions);
      };
      switch (config.exportType) {
        case 'settings': {
          importAppSettings(config.state.settings);
          break;
        }

        case 'sessions':
        case 'agents': {
          importSessionMap(config.state.sessions);

          break;
        }

        case 'all': {
          importSessionMap(config.state.sessions);
          importAppSettings(config.state.settings);

          break;
        }
      }
    });
  };

  return useMemo(() => ({ importConfig }), []);
};
