import { Table, TableCell, TableRow } from 'mdast';
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { LayoutChangeEvent, Text, TextStyle, View } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';

type TableContextType = {
  columnCount: number;
  columnWidths: number[];
  rowCount: number;
  setColumnWidth: (index: number, width: number) => void;
};

const TableContext = createContext<TableContextType>({
  columnCount: 0,
  columnWidths: [],
  rowCount: 0,
  setColumnWidth: () => {},
});

const useTableContext = (): TableContextType => {
  const context = useContext(TableContext);
  if (!context) {
    return {
      columnCount: 0,
      columnWidths: [],
      rowCount: 0,
      setColumnWidth: () => {},
    };
  }
  return context;
};

type TableContextProviderProps = {
  children: ReactNode;
  columnCount: number;
  rowCount: number;
};

const TableContextProvider = ({ rowCount, columnCount, children }: TableContextProviderProps) => {
  const { contentSize } = useMarkdownContext();
  const [columnWidths, setColumnWidths] = useState<number[]>([columnCount].fill(0));

  const setColumnWidth = useCallback(
    (index: number, width: number) => {
      setColumnWidths((prev) => {
        // Web: th/td { min-width: 120px }
        const minWidth = 120;
        const maxWidth = Number.POSITIVE_INFINITY;
        const old = prev[index] ?? 0;
        const newWidth = Math.min(Math.max(Math.max(old, width), minWidth), maxWidth);
        if (newWidth === old) return prev;

        const newColumnWidth = [...prev.slice(0, index), newWidth, ...prev.slice(index + 1)];
        return newColumnWidth;
      });
    },
    [contentSize, columnCount, setColumnWidths],
  );

  useLayoutEffect(() => {
    for (const [i, columnWidth] of columnWidths.entries()) {
      setColumnWidth(i, columnWidth ?? 0);
    }
  }, [columnWidths, setColumnWidth]);

  return (
    <TableContext.Provider value={{ columnCount, columnWidths, rowCount, setColumnWidth }}>
      {children}
    </TableContext.Provider>
  );
};

export const TableRenderer = ({ node }: RendererArgs<Table>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { TableRowRenderer } = renderers;

  return (
    <TableContextProvider
      columnCount={node.children[0]?.children.length ?? 0}
      rowCount={node.children.length ?? 0}
    >
      {/* <ScrollView horizontal> */}
      <View
        style={[
          {
            boxSizing: 'border-box',
            overflow: 'scroll',
            width: '100%',
          },
          styles.table,
        ]}
      >
        {node.children.map((child, idx) => (
          <TableRowRenderer index={idx} key={idx} node={child} parent={node} />
        ))}
      </View>
      {/* </ScrollView> */}
    </TableContextProvider>
  );
};

export const TableRowRenderer = ({ node, index }: RendererArgs<TableRow>): ReactNode => {
  const { renderers, styles } = useMarkdownContext();
  const { TableCellRenderer } = renderers;

  const rowStyle = index === 0 ? styles.thead : styles.tr;

  return (
    <View style={[{ flexDirection: 'row' }, rowStyle]}>
      {node.children.map((child, idx) => (
        <TableCellRenderer index={idx} key={idx} node={child} parent={node} rowIndex={index ?? 0} />
      ))}
    </View>
  );
};

export const TableCellRenderer = ({
  node,
  index,
  rowIndex,
}: RendererArgs<TableCell> & { rowIndex: number }): ReactNode => {
  const columnIndex = index ?? 0;
  const { columnWidths, setColumnWidth } = useTableContext();
  const { renderers, styles } = useMarkdownContext();
  const { PhrasingContentRenderer } = renderers;

  const width = columnWidths[columnIndex];

  const cellTextStyle = rowIndex === 0 ? styles.th : styles.td;

  const baseTextStyle = [cellTextStyle, rowIndex === 0 ? { fontWeight: 'bold' } : null];
  const measuredTextStyle: (TextStyle | undefined)[] = [
    { maxWidth: undefined, minWidth: undefined, width: undefined },
    {
      opacity: 0,
      position: 'absolute',
      textAlign: 'left',
      unicodeBidi: 'isolate',
      wordWrap: 'break-word',
      zIndex: -1000,
    },
    cellTextStyle,
  ];

  const padding = 8;
  const onTextLayout = useCallback(
    (e: LayoutChangeEvent) => setColumnWidth(columnIndex, e.nativeEvent.layout.width + padding * 2),
    [columnIndex, setColumnWidth],
  );

  const content = useMemo(
    () =>
      node.children.map((child, idx) => (
        <PhrasingContentRenderer index={idx} key={idx} node={child} parent={node} />
      )),
    [node, PhrasingContentRenderer],
  );

  return (
    <View>
      <View
        style={{
          justifyContent: 'center',
          minHeight: 32,
          padding: padding,
          width: width,
        }}
      >
        <Text style={baseTextStyle as any}>{content}</Text>
      </View>
      <Text numberOfLines={1} onLayout={onTextLayout} style={measuredTextStyle as any}>
        {content}
      </Text>
    </View>
  );
};
