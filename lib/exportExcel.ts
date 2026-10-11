/**
 * Real .xlsx download for any tabular list on the site — one navy header
 * row, autofilter, sensible column widths. Used wherever a page used to
 * hand back a plain CSV; the shape (array of {header,key,width} columns +
 * array of row objects keyed the same way) mirrors what exceljs itself
 * wants, so callers can pass their existing row-building logic straight
 * through instead of re-deriving a CSV string first.
 */
export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export async function downloadExcel(
  filename: string,
  sheetName: string,
  columns: ExcelColumn[],
  rows: Record<string, unknown>[],
) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'TalentMap';
  wb.created = new Date();

  const sheet = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || Math.max(c.header.length + 4, 14) }));
  sheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A1F5C' } };
    cell.alignment = { vertical: 'middle' };
  });
  for (const r of rows) sheet.addRow(r);
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  const buf = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
