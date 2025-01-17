import { createStyles } from 'antd-style';
import { ChevronDown, ChevronRight, Database, Table as TableIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useClientDataSWR } from '@/libs/swr';
import { tableViewerService } from '@/services/tableViewer';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import TableColumns from './TableColumns';

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
  dataPanel: css`
    overflow: hidden;
    display: flex;
    flex: 1;
    flex-direction: column;

    height: 100%;

    background: ${token.colorBgContainer};
  `,
  schemaHeader: css`
    display: flex;
    gap: 8px;
    align-items: center;

    padding-block: 12px;
    padding-inline: 16px;

    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  `,
  schemaPanel: css`
    overflow: scroll;

    width: 280px;
    height: 100%;
    border-inline-end: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgContainer};
  `,
  table: css`
    overflow: hidden;
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

      background: ${token.colorFillQuaternary};
    }

    td {
      padding: ${token.padding}px;
      border-block-end: 1px solid ${token.colorBorderSecondary};
      transition: all ${token.motionDurationMid};

      &:hover {
        background: ${token.colorFillQuaternary};
      }
    }
  `,
  tableItem: css`
    cursor: pointer;

    display: flex;
    gap: 8px;
    align-items: center;

    margin-inline: 8px;
    padding: 8px;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorText};

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
}));

interface SchemaPanelProps {
  onTableSelect: (tableName: string) => void;
}
const SchemaPanel = ({ onTableSelect }: SchemaPanelProps) => {
  const { styles } = useStyles();
  const [expandedTables, setExpandedTables] = useState(new Set());

  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);

  const { data, isLoading } = useClientDataSWR(isDBInited ? 'fetch-tables' : null, () =>
    tableViewerService.getAllTables(),
  );

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  return (
    <div className={styles.schemaPanel}>
      <div className={styles.schemaHeader}>
        <Database size={16} />
        <span>Tables {data?.length}</span>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Flexbox>
          {data?.map((table) => (
            <div key={table.name}>
              <Flexbox
                className={styles.tableItem}
                horizontal
                onClick={() => {
                  toggleTable(table.name);
                  onTableSelect(table.name);
                }}
              >
                {expandedTables.has(table.name) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <TableIcon size={16} />
                <span>{table.name}</span>
              </Flexbox>
              {expandedTables.has(table.name) && <TableColumns tableName={table.name} />}
            </div>
          ))}
        </Flexbox>
      )}
    </div>
  );
};

export default SchemaPanel;
