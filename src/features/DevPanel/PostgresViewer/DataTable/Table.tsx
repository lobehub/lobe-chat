import { createStyles } from 'antd-style';
import React from 'react';
import { Center } from 'react-layout-kit';
import { TableVirtuoso } from 'react-virtuoso';
import useSWR from 'swr';

import { tableViewerService } from '@/services/tableViewer';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { useTableColumns } from '../useTableColumns';
import TableCell from './TableCell';

const useStyles = createStyles(({ token, css }) => ({
  columnList: css`
    margin-inline-start: 32px;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};

    > div {
      padding-block: ${token.paddingXS}px;
      padding-inline: 0;
    }
  `,
  table: css`
    overflow: scroll hidden;
    flex: 1;

    table {
      border-collapse: collapse;
      width: 100%;
      margin-inline-end: 12px;
      font-family: ${token.fontFamilyCode};
    }

    thead {
      tr {
        outline: 1px solid ${token.colorBorderSecondary};
      }
    }

    th,
    td {
      overflow: hidden;

      max-width: 200px;
      padding-block: 8px;
      padding-inline: 12px;
      border-inline-end: 1px solid ${token.colorBorderSecondary};

      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    th {
      position: sticky;
      z-index: 1;
      inset-block-start: 0;

      border-block-end: 1px solid ${token.colorBorderSecondary};

      font-weight: ${token.fontWeightStrong};
      text-align: start;
      text-wrap: nowrap;

      background: ${token.colorBgElevated};
    }

    td {
      border-block-end: 1px solid ${token.colorBorderSecondary};
      text-wrap: nowrap;
    }

    tbody {
      tr:hover {
        background: ${token.colorFillTertiary};
      }
    }
  `,
  tableItem: css`
    cursor: pointer;

    display: flex;
    gap: ${token.padding}px;
    align-items: center;

    padding: 12px;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorText};
  `,
}));

interface TableProps {
  tableName?: string;
}

const Table = ({ tableName }: TableProps) => {
  const { styles } = useStyles();

  const tableColumns = useTableColumns(tableName);
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  const tableData = useSWR(
    isDBInited && tableName ? ['fetch-table-data', tableName] : null,
    ([, table]) => tableViewerService.getTableData(table),
  );

  const columns = tableColumns.data?.map((t) => t.name) || [];
  const isLoading = tableColumns.isLoading || tableData.isLoading;

  if (!tableName) return <Center height={'80%'}>Select a table to view data</Center>;

  if (isLoading) return <Center height={'80%'}>Loading...</Center>;

  const dataSource = tableData.data?.data || [];
  const header = (
    <tr>
      {columns.map((column) => (
        <th key={column}>{column}</th>
      ))}
    </tr>
  );

  return (
    <div className={styles.table}>
      {dataSource.length === 0 ? (
        <>
          <table>
            <thead>{header}</thead>
          </table>
          <Center height={400}>no rows</Center>
        </>
      ) : (
        <TableVirtuoso
          data={dataSource}
          fixedHeaderContent={() => header}
          itemContent={(index, row) => (
            <>
              {columns.map((column) => (
                <TableCell
                  column={column}
                  dataItem={row}
                  key={`${column}_${index}`}
                  rowIndex={index}
                />
              ))}
            </>
          )}
        />
      )}
    </div>
  );
};

export default Table;
