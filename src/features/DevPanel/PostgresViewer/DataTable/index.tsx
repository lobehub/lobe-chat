import { Empty } from 'antd';
import { createStyles } from 'antd-style';
import { Download, Filter, RefreshCw } from 'lucide-react';
import React from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import { mutate } from 'swr';

import { exportService } from '@/services/export';

import Header from '../../features/Header';
import Table from '../../features/Table';
import { FETCH_TABLE_DATA_KEY, usePgTable, useTableColumns } from '../usePgTable';

const useStyles = createStyles(({ token, css }) => ({
  dataPanel: css`
    overflow: hidden;
    background: ${token.colorBgContainer};
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
      <Header
        actions={[
          {
            icon: Filter,
            title: 'Filter',
          },
          {
            icon: Download,
            onClick: async () => {
              const data = await exportService.exportData();
              console.log(data);
            },
            title: 'Export',
          },
          {
            icon: RefreshCw,
            onClick: async () => {
              await mutate(FETCH_TABLE_DATA_KEY(tableName));
            },
            title: 'Refresh',
          },
        ]}
        title={tableName || 'Select a table'}
      />
      {tableName ? (
        <Table columns={columns} dataSource={dataSource} loading={isLoading} />
      ) : (
        <Center height={'80%'}>
          <Empty description={'Select a table to view data'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Center>
      )}
    </Flexbox>
  );
};

export default DataTable;
