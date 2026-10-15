import * as XLSX from 'xlsx';

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
): void {
  if (!data || data.length === 0) return;

  const headers = columns ? columns.map(c => c.header) : Object.keys(data[0]);
  const rows = data.map(item => {
    if (columns) {
      return columns.map(col => {
        const val = item[col.key];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',');
    }
    return Object.values(item).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
  });

  // Include UTF-8 BOM (\uFEFF) for Thai language support in Microsoft Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName = 'Sheet1'
): void {
  if (!data || data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
