import { DraggablePanel, DraggablePanelBody, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronDown, ChevronRight, Database, Loader2Icon, Table as TableIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useFetchTables } from '../usePgTable';
import Columns from './Columns';

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
    font-weight: ${token.fontWeightStrong};
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
    <DraggablePanel minWidth={264} placement={'left'}>
      <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }}>
        <Flexbox
          align={'center'}
          className={styles.schemaHeader}
          gap={8}
          horizontal
          paddingBlock={12}
          paddingInline={16}
        >
          <Database size={16} />
          <Flexbox align={'center'} horizontal justify={'space-between'}>
            <span>Tables {data?.length}</span>
            <span className={styles.schema}>public</span>
          </Flexbox>
        </Flexbox>
        <DraggablePanelBody style={{ padding: 0 }}>
          {isLoading ? (
            <Center height={'100%'} width={'100%'}>
              <Icon icon={Loader2Icon} spin />
            </Center>
          ) : (
            data?.map((table) => (
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
                {expandedTables.has(table.name) && <Columns tableName={table.name} />}
              </div>
            ))
          )}
        </DraggablePanelBody>
      </Flexbox>
    </DraggablePanel>
  );
};

export default SchemaPanel;
