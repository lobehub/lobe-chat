import React, { useMemo } from 'react';

interface TableCellProps {
  column: string;
  dataItem: any;
  rowIndex: number;
}

const TableCell = ({ dataItem, column, rowIndex }: TableCellProps) => {
  const data = dataItem[column];
  const content = useMemo(() => {
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
      {content}
    </td>
  );
};

export default TableCell;
