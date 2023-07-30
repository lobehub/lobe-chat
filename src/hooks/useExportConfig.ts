import { useMemo } from 'react';

import { exportAgents, exportAll, exportSessions, exportSettings } from '@/helpers/export';

export const useExportConfig = () =>
  useMemo(() => ({ exportAgents, exportAll, exportSessions, exportSettings }), []);
