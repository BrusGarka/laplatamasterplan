/**
 * Parseia export .xlsx/.xls da XP (quando disponível via Playwright).
 */

export async function parseXlsFile(filePath) {
  const XLSX = await import("xlsx");
  const { readFileSync } = await import("fs");
  const wb = XLSX.read(readFileSync(filePath), { type: "buffer" });
  const sheets = {};
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    sheets[name] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  }
  return {
    sheetNames: wb.SheetNames,
    sheets,
  };
}
