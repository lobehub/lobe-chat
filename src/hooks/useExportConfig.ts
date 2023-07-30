import { transform } from 'lodash-es';
import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';

import { Migration } from '@/migrations';
import { useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';
import {
  ConfigFileAgents,
  ConfigFileAll,
  ConfigFileSessions,
  ConfigFileSettings,
} from '@/types/exportConfig';
import { exportConfigFile } from '@/utils/config';

export const useExportConfig = () => {
  const [sessions] = useSessionStore((s) => [s.sessions], shallow);

  const [settings] = useSettings((s) => [s.settings, s.importSettings], shallow);

  const exportAgents = () => {
    const config: ConfigFileAgents = {
      exportType: 'agents',
      state: {
        sessions: transform(sessions, (result, value, key) => {
          result[key] = { ...value, chats: {}, topics: {} };
        }),
      },
      version: Migration.targetVersion,
    };

    exportConfigFile(config, 'agents');
  };

  const exportSessions = () => {
    const config: ConfigFileSessions = {
      exportType: 'sessions',
      state: { sessions },
      version: Migration.targetVersion,
    };

    exportConfigFile(config, 'sessions');
  };

  const exportSettings = () => {
    const config: ConfigFileSettings = {
      exportType: 'settings',
      state: { settings },
      version: Migration.targetVersion,
    };

    exportConfigFile(config, 'settings');
  };

  const exportAll = () => {
    // 将 入参转换为 配置文件格式
    const config: ConfigFileAll = {
      exportType: 'all',
      state: { sessions, settings },
      version: Migration.targetVersion,
    };
    exportConfigFile(config, 'config');
  };

  return useMemo(
    () => ({ exportAgents, exportAll, exportSessions, exportSettings }),
    [sessions, settings],
  );
};
