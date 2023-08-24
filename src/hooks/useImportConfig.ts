import { useMemo } from 'react';

import { useGlobalStore } from '@/store/global';
import { usePluginStore } from '@/store/plugin';
import { useSessionStore } from '@/store/session';
import { importConfigFile } from '@/utils/config';

export const useImportConfig = () => {
  const importSessions = useSessionStore((s) => s.importSessions);
  const importAppSettings = useGlobalStore((s) => s.importAppSettings);
  const checkLocalEnabledPlugins = usePluginStore((s) => s.checkLocalEnabledPlugins);

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

          // 检查一下插件开启情况
          checkLocalEnabledPlugins(config.state.sessions);
          break;
        }

        case 'all': {
          importSessions(config.state.sessions);
          importAppSettings(config.state.settings);

          // 检查一下插件开启情况
          checkLocalEnabledPlugins(config.state.sessions);
          break;
        }
      }
    });
  };

  return useMemo(() => ({ importConfig }), []);
};
