import { ActionIcon, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { Download, Filter, RefreshCw } from 'lucide-react';
import React from 'react';
import { Center } from 'react-layout-kit';
import { TableVirtuoso } from 'react-virtuoso';

import { useClientDataSWR } from '@/libs/swr';
import { tableViewerService } from '@/services/tableViewer';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { useTableColumns } from '../useTableColumns';
import TableCell from './TableCell';

const useStyles = createStyles(({ token, css }) => ({
  button: css`
    cursor: pointer;

    display: flex;
    gap: 4px;
    align-items: center;

    padding-block: ${token.paddingXS}px;
    padding-inline: ${token.padding}px;
    border: none;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorText};

    background: ${token.colorFillSecondary};

    transition: all ${token.motionDurationMid};

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  columnList: css`
    margin-inline-start: 32px;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};

    > div {
      padding-block: ${token.paddingXS}px;
      padding-inline: 0;
    }
  `,
  dataPanel: css`
    overflow: hidden;
    display: flex;
    flex: 1;
    flex-direction: column;

    height: 100%;

    background: ${token.colorBgContainer};
  `,
  table: css`
    overflow: scroll hidden;
    flex: 1;

    table {
      border-collapse: collapse;
      width: 100%;
    }

    thead {
      tr {
        outline: 1px solid ${token.colorBorderSecondary};
      }
    }

    th {
      position: sticky;
      z-index: 1;
      inset-block-start: 0;

      padding: 12px;
      border-block-end: 1px solid ${token.colorBorderSecondary};

      font-weight: ${token.fontWeightStrong};
      text-align: start;
      text-wrap: nowrap;

      background: ${token.colorBgElevated};
    }

    td {
      padding: ${token.padding}px;
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
  toolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-block: 12px;
    padding-inline: 16px;
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
  toolbarButtons: css`
    display: flex;
    gap: 4px;
  `,
  toolbarTitle: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  `,
}));

interface DataTableProps {
  tableName: string;
}

const DataTable = ({ tableName }: DataTableProps) => {
  const { styles } = useStyles();

  const tableColumns = useTableColumns(tableName);
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  const tableData = useClientDataSWR(
    isDBInited && tableName ? ['fetch-table-data', tableName] : null,
    ([, table]) => tableViewerService.getTableData(table),
  );

  const columns = tableColumns.data?.map((t) => t.name) || [];
  const isLoading = tableColumns.isLoading || tableData.isLoading;

  console.log(tableData.data);
  return (
    <div className={styles.dataPanel}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>{tableName || 'Select a table'}</div>
        <div className={styles.toolbarButtons}>
          <Button color={'default'} icon={<Icon icon={Filter} />} variant={'filled'}>
            Filter
          </Button>
          <ActionIcon icon={Download} title={'Export'} />
          <ActionIcon icon={RefreshCw} title={'Refresh'} />
        </div>
      </div>

      {/* Table */}
      <div className={styles.table}>
        {tableName ? (
          isLoading ? (
            <Center height={'80%'}>Loading...</Center>
          ) : (
            <TableVirtuoso
              data={tableData.data?.data || []}
              fixedHeaderContent={() => (
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              )}
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
          )
        ) : (
          <Center height={'80%'}>Select a table to view data</Center>
        )}
      </div>
    </div>
  );
};

export default DataTable;
