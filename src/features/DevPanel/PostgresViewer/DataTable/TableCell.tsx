import React from 'react';

interface TableCellProps {
  column: string;
  dataItem: any;
  rowIndex: number;
}

const TableCell = ({ dataItem, column, rowIndex }: TableCellProps) => {
  return (
    <td key={column} onDoubleClick={() => console.log('Edit cell:', rowIndex, column)}>
      {typeof dataItem[column] === 'string' ? dataItem[column] : null}
    </td>
  );
};

export default TableCell;
