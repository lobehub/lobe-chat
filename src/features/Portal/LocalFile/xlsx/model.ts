import type { Border, Cell, Color, Row, Worksheet } from 'exceljs';

export interface CellStyle {
  b?: 1;
  bd?: Partial<Record<'b' | 'l' | 'r' | 't', [number, string]>>;
  bg?: string;
  fc?: string;
  ff?: string;
  fs?: number;
  h?: string;
  i?: 1;
  v?: string;
  w?: 1;
}

export interface CellModel {
  c: number;
  cs?: number;
  rs?: number;
  s: CellStyle;
  t: string;
}

export interface RowModel {
  cells: CellModel[];
  h: number | null;
  r: number;
}

export interface SheetModel {
  cols: number[];
  frozen: { cols: number; rows: number } | null;
  name: string;
  rowCount: number;
  rows: RowModel[];
  truncated: boolean;
}

export const MAX_PREVIEW_ROWS = 500;

const hex = (color?: Partial<Color>): string | undefined => {
  const argb = color?.argb;
  if (!argb) return undefined;
  return '#' + (argb.length === 8 ? argb.slice(2) : argb);
};

const formatNumber = (value: number, numFmt?: string): string => {
  if (!numFmt || numFmt === 'General') return String(Math.round(value * 1e10) / 1e10);
  const pattern = numFmt.split(';')[0];
  const isPercentage = pattern.includes('%');
  const displayValue = isPercentage ? value * 100 : value;
  const decimals = pattern.match(/\.(0+)/)?.[1].length ?? 0;
  const currency = pattern.match(/[$£¥€]/)?.[0] ?? '';
  let body = Math.abs(displayValue).toFixed(decimals);
  if (pattern.includes('#,##')) {
    const [int, frac] = body.split('.');
    body = int.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? '.' + frac : '');
  }
  return (displayValue < 0 ? '-' : '') + currency + body + (isPercentage ? '%' : '');
};

const cellText = (cell: Cell): string => {
  const value = cell.value;
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') return formatNumber(value, cell.numFmt);
  if (typeof value === 'object') {
    const rich = value as {
      error?: string;
      formula?: string;
      result?: unknown;
      richText?: { text: string }[];
      sharedFormula?: string;
      text?: unknown;
    };
    if (rich.richText) return rich.richText.map((run) => run.text).join('');
    if (rich.formula !== undefined || rich.sharedFormula !== undefined) {
      const result = rich.result;
      if (result === null || result === undefined) return '';
      if (typeof result === 'number') return formatNumber(result, cell.numFmt);
      if (typeof result === 'object') return (result as { error?: string }).error ?? '';
      return String(result);
    }
    if (rich.text !== undefined) return String(rich.text);
    return rich.error ?? '';
  }
  return String(value);
};

const isNumericCell = (cell: Cell): boolean => {
  const value = cell.value;
  if (typeof value === 'number') return true;
  return typeof (value as { result?: unknown })?.result === 'number';
};

const BORDER_WIDTH: Record<string, number> = {
  double: 3,
  hair: 1,
  medium: 2,
  thick: 3,
  thin: 1,
};

const borderSide = (side?: Partial<Border>): [number, string] | undefined =>
  side?.style ? [BORDER_WIDTH[side.style] ?? 1, hex(side.color) ?? '#bfbfbf'] : undefined;

const readCellStyle = (cell: Cell, numeric: boolean): CellStyle => {
  const font = cell.font ?? {};
  const alignment = cell.alignment ?? {};
  const border = cell.border ?? {};
  const style: CellStyle = { h: alignment.horizontal ?? (numeric ? 'right' : 'left') };

  if (font.bold) style.b = 1;
  if (font.italic) style.i = 1;
  if (font.size) style.fs = font.size;
  if (font.name) style.ff = font.name;
  const fontColor = hex(font.color);
  if (fontColor) style.fc = fontColor;

  const fill = cell.fill;
  if (fill?.type === 'pattern' && fill.pattern === 'solid') {
    const background = hex(fill.fgColor);
    if (background) style.bg = background;
  }

  if (alignment.vertical) style.v = alignment.vertical;
  if (alignment.wrapText) style.w = 1;

  const sides: CellStyle['bd'] = {};
  for (const [key, side] of [
    ['t', border.top],
    ['l', border.left],
    ['b', border.bottom],
    ['r', border.right],
  ] as const) {
    const parsed = borderSide(side);
    if (parsed) sides[key] = parsed;
  }
  if (Object.keys(sides).length > 0) style.bd = sides;

  return style;
};

const columnLetterToIndex = (letters: string): number =>
  [...letters].reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0);

const readMerges = (sheet: Worksheet) => {
  const spans = new Map<string, [number, number]>();
  const covered = new Set<string>();

  for (const ref of Object.values(sheet.model.merges ?? {}) as string[]) {
    const parsed = /([A-Z]+)(\d+):([A-Z]+)(\d+)/.exec(ref);
    if (!parsed) continue;
    const startCol = columnLetterToIndex(parsed[1]);
    const startRow = Number(parsed[2]);
    const endCol = columnLetterToIndex(parsed[3]);
    const endRow = Number(parsed[4]);
    spans.set(`${startRow}:${startCol}`, [endRow - startRow + 1, endCol - startCol + 1]);
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (row !== startRow || col !== startCol) covered.add(`${row}:${col}`);
      }
    }
  }

  return { covered, spans };
};

const readSheet = (sheet: Worksheet): SheetModel => {
  const colCount = Math.max(sheet.actualColumnCount, 1);
  const view = sheet.views?.[0] as { state?: string; xSplit?: number; ySplit?: number } | undefined;
  const { covered, spans } = readMerges(sheet);

  const rows: RowModel[] = [];
  sheet.eachRow((row: Row) => {
    if (rows.length >= MAX_PREVIEW_ROWS) return;
    const rowIndex = row.number;
    const cells: CellModel[] = [];
    for (let colIndex = 1; colIndex <= colCount; colIndex++) {
      if (covered.has(`${rowIndex}:${colIndex}`)) continue;
      const cell = row.getCell(colIndex);
      const text = cellText(cell);
      const style = readCellStyle(cell, isNumericCell(cell));
      const span = spans.get(`${rowIndex}:${colIndex}`);
      if (!text && !style.bg && !style.bd && !span) {
        cells.push({ c: colIndex, s: {}, t: '' });
        continue;
      }
      cells.push({
        c: colIndex,
        s: style,
        t: text,
        ...(span ? { cs: span[1], rs: span[0] } : {}),
      });
    }
    rows.push({ cells, h: row.height ?? null, r: rowIndex });
  });

  const cols: number[] = [];
  for (let colIndex = 1; colIndex <= colCount; colIndex++) {
    cols.push(Math.round((sheet.getColumn(colIndex).width ?? 8.43) * 7 + 5));
  }

  return {
    cols,
    frozen: view?.state === 'frozen' ? { cols: view.xSplit ?? 0, rows: view.ySplit ?? 0 } : null,
    name: sheet.name,
    rowCount: rows.length,
    rows,
    truncated: sheet.actualRowCount > MAX_PREVIEW_ROWS,
  };
};

export const readWorkbook = async (blob: Blob): Promise<SheetModel[]> => {
  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();
  await workbook.xlsx.load(await blob.arrayBuffer());
  return workbook.worksheets.map((sheet) => readSheet(sheet));
};
