import React from 'react';

interface TableCellProps {
  column: string;
  dataItem: any;
  rowIndex: number;
}

const TableCell = ({ dataItem, column, rowIndex }: TableCellProps) => {
  const data =
    typeof dataItem[column] === 'object' ? JSON.stringify(dataItem[column]) : dataItem[column];

  return (
    <td key={column} onDoubleClick={() => console.log('Edit cell:', rowIndex, column)}>
      {data}
    </td>
  );
};

export default TableCell;
