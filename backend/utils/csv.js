/**
 * Utilidad mínima para generar CSV.
 *   toCsv(rows, [{ header: 'Nombre', key: 'nombre' }, { header: 'Edad', value: (r) => r.edad }])
 */
const escapeCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  // Evita inyección de fórmulas al abrir el CSV en Excel/Sheets
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCell(c.header)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(c.value ? c.value(row) : row[c.key])).join(',')
  );
  return [header, ...lines].join('\r\n');
}

module.exports = { toCsv, escapeCell };
