import useSWR from 'swr';

import { tableViewerService } from '@/services/tableViewer';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const FETCH_TABLE_DATA_KEY = (tableName: string) => ['fetch-table-data', tableName];

export const useFetchTables = () => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  return useSWR(isDBInited ? 'fetch-tables' : null, () => tableViewerService.getAllTables());
};

export const useTableColumns = (tableName?: string) => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  return useSWR(isDBInited && tableName ? ['fetch-table-columns', tableName] : null, ([, table]) =>
    tableViewerService.getTableDetails(table),
  );
};

export const usePgTable = (tableName?: string) => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  return useSWR(isDBInited && tableName ? FETCH_TABLE_DATA_KEY(tableName) : null, ([, table]) =>
    tableViewerService.getTableData(table),
  );
};
