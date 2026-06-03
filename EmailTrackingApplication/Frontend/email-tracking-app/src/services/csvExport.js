/**
 * exportToCSV — build a CSV from column headers + row arrays and trigger download.
 * @param {string[]} columns - column header labels
 * @param {Array<Array<any>>} rows - 2D array of cell values (same order as columns)
 * @param {string} filename - file name without extension
 */
export const exportToCSV = (columns, rows, filename = 'export') => {
  const escape = (val) => {
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const lines = [
    columns.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
