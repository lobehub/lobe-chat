import useSWR from 'swr';

import { tableViewerService } from '@/services/tableViewer';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const useTableColumns = (tableName?: string) => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  return useSWR(isDBInited && tableName ? ['fetch-table-columns', tableName] : null, ([, table]) =>
    tableViewerService.getTableDetails(table),
  );
};
