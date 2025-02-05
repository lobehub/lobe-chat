import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { get, isDate } from 'lodash-es';
import React, { useMemo } from 'react';

import TooltipContent from './TooltipContent';

const { Text } = Typography;

const useStyles = createStyles(({ token, css }) => ({
  cell: css`
    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;
  `,
  tooltip: css`
    border: 1px solid ${token.colorBorder};

    font-family: ${token.fontFamilyCode};
    font-size: ${token.fontSizeSM}px;
    color: ${token.colorText} !important;
    word-break: break-all;

    background: ${token.colorBgElevated} !important;
  `,
}));

interface TableCellProps {
  column: string;
  dataItem: any;
  rowIndex: number;
}

const TableCell = ({ dataItem, column, rowIndex }: TableCellProps) => {
  const { styles } = useStyles();
  const data = get(dataItem, column);
  const content = useMemo(() => {
    if (isDate(data)) return dayjs(data).format('YYYY-MM-DD HH:mm:ss');

    switch (typeof data) {
      case 'object': {
        return JSON.stringify(data);
      }

      case 'boolean': {
        return data ? 'True' : 'False';
      }

      default: {
        return data;
      }
    }
  }, [data]);

  return (
    <td key={column} onDoubleClick={() => console.log('Edit cell:', rowIndex, column)}>
      <Text
        className={styles.cell}
        ellipsis={{
          tooltip: {
            arrow: false,
            classNames: { body: styles.tooltip },
            title: <TooltipContent>{content}</TooltipContent>,
          },
        }}
      >
        {content}
      </Text>
    </td>
  );
};

export default TableCell;
