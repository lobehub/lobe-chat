import { Workbook } from 'exceljs';
import { describe, expect, it } from 'vitest';

import { readWorkbook } from './model';

const readWorksheet = async (workbook: Workbook) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const [sheet] = await readWorkbook(new Blob([buffer as BlobPart]));

  return sheet;
};

describe('readWorkbook', () => {
  it('keeps sparse worksheet rows at their physical row positions', async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sparse');

    worksheet.getCell('A1').value = 'first';
    worksheet.getCell('A2').value = 'second';
    worksheet.getCell('A3').value = 'third';
    worksheet.getCell('A4').value = 'fourth';
    worksheet.getCell('A6').value = 'sixth';

    const sheet = await readWorksheet(workbook);

    expect(sheet.rows.map((row) => row.r)).toEqual([1, 2, 3, 4, 6]);
    expect(sheet.rows.at(-1)?.cells[0].t).toBe('sixth');
  });

  it('formats percentage cells by scaling the stored value', async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Percent');

    worksheet.getCell('A1').value = 0.15;
    worksheet.getCell('A1').numFmt = '0%';
    worksheet.getCell('A2').value = -0.125;
    worksheet.getCell('A2').numFmt = '0.0%';

    const sheet = await readWorksheet(workbook);

    expect(sheet.rows[0].cells[0].t).toBe('15%');
    expect(sheet.rows[1].cells[0].t).toBe('-12.5%');
  });
});
