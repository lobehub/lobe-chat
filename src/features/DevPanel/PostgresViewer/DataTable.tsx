import { ActionIcon, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { Download, Filter, RefreshCw } from 'lucide-react';
import React from 'react';
import { Center } from 'react-layout-kit';
import { TableVirtuoso } from 'react-virtuoso';

import { MOCK_DATA, MOCK_TABLES } from '@/features/DevPanel/PostgresViewer/mockData';

// 样式定义
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

    th {
      position: sticky;
      z-index: 1;
      inset-block-start: 0;

      padding: ${token.padding}px;
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

      &:hover {
        background: ${token.colorFillQuaternary};
      }
    }
  `,
  tableItem: css`
    cursor: pointer;

    display: flex;
    gap: ${token.padding}px;
    align-items: center;

    padding: ${token.padding}px;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorText};

    &:hover {
      background: ${token.colorFillSecondary};
    }
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
    gap: ${token.padding}px;
  `,
  toolbarTitle: css`
    font-size: ${token.fontSizeLG}px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  `,
}));

interface DataPanelProps {
  selectedTable: string;
}

const DataPanel = ({ selectedTable }: DataPanelProps) => {
  const { styles } = useStyles();
  const columns = MOCK_TABLES.find((t) => t.name === selectedTable)?.columns || [];

  return (
    <div className={styles.dataPanel}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>{selectedTable || 'Select a table'}</div>
        <div className={styles.toolbarButtons}>
          <Button className={styles.button} icon={<Icon icon={Filter} />}>
            Filter
          </Button>
          <ActionIcon icon={Download} title={'Export'} />
          <ActionIcon icon={RefreshCw} title={'Refresh'} />
        </div>
      </div>

      {/* Table */}
      <div className={styles.table}>
        {selectedTable ? (
          <TableVirtuoso
            data={MOCK_DATA}
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
                  <td key={column} onDoubleClick={() => console.log('Edit cell:', index, column)}>
                    {
                      // @ts-expect-error
                      row[column]
                    }
                  </td>
                ))}
              </>
            )}
          />
        ) : (
          <Center height={'80%'}>Select a table to view data</Center>
        )}
      </div>
    </div>
  );
};

export default DataPanel;
