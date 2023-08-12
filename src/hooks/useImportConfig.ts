import { useMemo } from 'react';
import { useSettings } from 'src/store/global';

import { useSessionStore } from '@/store/session';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const importSessions = useSessionStore((s) => s.importSessions);
  const importAppSettings = useSettings((s) => s.importAppSettings);

  const importConfig = (info: any) => {
    importConfigFile(info, (config) => {
      switch (config.exportType) {
        case 'settings': {
          importAppSettings(config.state.settings);
          break;
        }

        case 'sessions':
        case 'agents': {
          importSessions(config.state.sessions);
          break;
        }

        case 'all': {
          importSessions(config.state.sessions);
          importAppSettings(config.state.settings);

          break;
        }
      }
    });
  };

  return useMemo(() => ({ importConfig }), []);
};
