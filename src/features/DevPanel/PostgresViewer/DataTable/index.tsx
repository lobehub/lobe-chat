import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Download, Filter, RefreshCw } from 'lucide-react';
import React from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import { mutate } from 'swr';

import Table from '../../Table';
import { FETCH_TABLE_DATA_KEY, usePgTable, useTableColumns } from '../usePgTable';

const useStyles = createStyles(({ token, css }) => ({
  dataPanel: css`
    overflow: hidden;
    background: ${token.colorBgContainer};
  `,
  header: css`
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
  title: css`
    font-weight: 500;
  `,
  toolbarButtons: css`
    display: flex;
    gap: 4px;
  `,
}));

interface DataTableProps {
  tableName: string;
}

const DataTable = ({ tableName }: DataTableProps) => {
  const { styles } = useStyles();

  const tableColumns = useTableColumns(tableName);
  const tableData = usePgTable(tableName);
  const columns = tableColumns.data?.map((t) => t.name) || [];
  const isLoading = tableColumns.isLoading || tableData.isLoading;
  const dataSource = tableData.data?.data || [];

  return (
    <Flexbox className={styles.dataPanel} flex={1} height={'100%'}>
      {/* Toolbar */}
      <Flexbox
        align={'center'}
        className={styles.header}
        height={46}
        horizontal
        justify={'space-between'}
        paddingInline={16}
      >
        <div className={styles.title}>{tableName || 'Select a table'}</div>
        <div className={styles.toolbarButtons}>
          <ActionIcon icon={Filter} size={{ blockSize: 28, fontSize: 16 }} title={'Filter'} />
          <ActionIcon icon={Download} size={{ blockSize: 28, fontSize: 16 }} title={'Export'} />
          <ActionIcon
            icon={RefreshCw}
            onClick={async () => {
              await mutate(FETCH_TABLE_DATA_KEY(tableName));
            }}
            size={{ blockSize: 28, fontSize: 16 }}
            title={'Refresh'}
          />
        </div>
      </Flexbox>
      {tableName ? (
        <Table columns={columns} dataSource={dataSource} loading={isLoading} />
      ) : (
        <Center height={'80%'}>Select a table to view data</Center>
      )}
    </Flexbox>
  );
};

export default DataTable;
