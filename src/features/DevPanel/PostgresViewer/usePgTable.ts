import useSWR from 'swr';

import { tableViewerService } from '@/services/tableViewer';

const FETCH_TABLES = 'fetch-tables';
const FETCH_TABLE_COLUMN_KEY = (tableName: string) => ['fetch-table-columns', tableName];
export const FETCH_TABLE_DATA_KEY = (tableName: string) => ['fetch-table-data', tableName];

export const useFetchTables = () => {
  return useSWR(FETCH_TABLES, () => tableViewerService.getAllTables());
};

export const useTableColumns = (tableName?: string) => {
  return useSWR(tableName ? FETCH_TABLE_COLUMN_KEY(tableName) : null, ([, table]) =>
    tableViewerService.getTableDetails(table),
  );
};

export const usePgTable = (tableName?: string) => {
  return useSWR(
    tableName ? FETCH_TABLE_DATA_KEY(tableName) : null,
    ([, table]) => tableViewerService.getTableData(table) as any,
  );
};
