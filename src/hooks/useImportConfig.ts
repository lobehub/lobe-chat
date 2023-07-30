import { useMemo } from 'react';

import { useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const importSessions = useSessionStore((s) => s.importSessions);
  const importSettings = useSettings((s) => s.importSettings);

  const importConfig = (info: any) => {
    importConfigFile(info, (config) => {
      switch (config.exportType) {
        case 'settings': {
          importSettings(config.state.settings);
          break;
        }

        case 'sessions':
        case 'agents': {
          importSessions(config.state.sessions);
          break;
        }

        case 'all': {
          importSessions(config.state.sessions);
          importSettings(config.state.settings);

          break;
        }
      }
    });
  };

  return useMemo(() => ({ importConfig }), []);
};
