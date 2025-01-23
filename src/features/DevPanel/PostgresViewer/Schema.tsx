import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronDown, ChevronRight, Database, Table as TableIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import TableColumns from './TableColumns';
import { useFetchTables } from './usePgTable';

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
  count: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  dataPanel: css`
    overflow: hidden;
    display: flex;
    flex: 1;
    flex-direction: column;

    height: 100%;

    background: ${token.colorBgContainer};
  `,
  schema: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    font-weight: normal;
    color: ${token.colorTextTertiary};
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
  selected: css`
    background: ${token.colorFillSecondary};
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
  selectedTable?: string;
}
const SchemaPanel = ({ onTableSelect, selectedTable }: SchemaPanelProps) => {
  const { styles, cx } = useStyles();
  const [expandedTables, setExpandedTables] = useState(new Set());

  const { data, isLoading } = useFetchTables();

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
        <Flexbox align={'center'} horizontal justify={'space-between'}>
          <span>Tables {data?.length}</span>
          <span className={styles.schema}>public</span>
        </Flexbox>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Flexbox>
          {data?.map((table) => (
            <div key={table.name}>
              <Flexbox
                className={cx(styles.tableItem, selectedTable === table.name && styles.selected)}
                horizontal
                onClick={() => {
                  toggleTable(table.name);
                  onTableSelect(table.name);
                }}
              >
                <Icon icon={expandedTables.has(table.name) ? ChevronDown : ChevronRight} />
                <TableIcon size={16} />
                <Flexbox align={'center'} horizontal justify={'space-between'}>
                  <span>{table.name}</span>
                  <span className={styles.count}>{table.count}</span>
                </Flexbox>
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
