/** Builds an RFC 4180 CSV string from a header row + data rows, prefixed
 * with a UTF-8 BOM. Without the BOM, Excel (particularly on Windows)
 * guesses the wrong encoding for a plain UTF-8 file and garbles any
 * Chinese content into mojibake - the BOM makes it detect UTF-8 correctly. */
export function toCsv(rows: (string | number)[][]): string {
  const escape = (value: string | number) => {
    const str = String(value);
    return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const body = rows.map((row) => row.map(escape).join(",")).join("\r\n");
  return `﻿${body}`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
