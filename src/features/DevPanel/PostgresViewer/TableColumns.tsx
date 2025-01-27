import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { Flexbox } from 'react-layout-kit';

import { useTableColumns } from './usePgTable';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    margin-inline: 40px 4px;
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorTextSecondary};
  `,
  item: css`
    padding-block: 4px;
    padding-inline: 0;
    font-family: ${token.fontFamilyCode};
  `,
  type: css`
    font-size: 10px;
    color: ${token.red9};
  `,
}));

interface TableColumnsProps {
  tableName: string;
}

const TableColumns = ({ tableName }: TableColumnsProps) => {
  const { styles } = useStyles();

  const { data, isLoading } = useTableColumns(tableName);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Flexbox>
          {data?.map((column) => (
            <Flexbox
              align={'center'}
              className={styles.item}
              horizontal
              justify={'space-between'}
              key={column.name}
            >
              <Flexbox>
                <Flexbox>{column.name}</Flexbox>
                <span className={styles.type}>{column.type}</span>
              </Flexbox>
              {column.isPrimaryKey && (
                <div>
                  <Tag bordered={false} color={'cyan'}>
                    Primary
                  </Tag>
                </div>
              )}
            </Flexbox>
          ))}
        </Flexbox>
      )}
    </div>
  );
};

export default TableColumns;
