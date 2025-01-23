import { ActionIcon, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { Download, Filter, RefreshCw } from 'lucide-react';
import React from 'react';
import { mutate } from 'swr';

import { FETCH_TABLE_DATA_KEY } from '../usePgTable';
import Table from './Table';

const useStyles = createStyles(({ token, css }) => ({
  dataPanel: css`
    overflow: hidden;
    display: flex;
    flex: 1;
    flex-direction: column;

    height: 100%;

    background: ${token.colorBgContainer};
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
          <ActionIcon
            icon={RefreshCw}
            onClick={async () => {
              await mutate(FETCH_TABLE_DATA_KEY(tableName));
            }}
            title={'Refresh'}
          />
        </div>
      </div>

      {/* Table */}
      <Table tableName={tableName} />
    </div>
  );
};

export default DataTable;
