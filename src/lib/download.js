// ============================================
// 📥 UTILIDADES DE DESCARGA / CSV (solo navegador)
// ============================================
const escapeCell = (value) => {
    const text = value === null || value === undefined ? '' : String(value)
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * toCsv(rows, [{ header: 'Nombre', key: 'nombre' }, { header: 'Edad', value: (r) => r.edad }])
 */
export function toCsv(rows, columns) {
    const header = columns.map((c) => escapeCell(c.header)).join(',')
    const lines = rows.map((row) =>
        columns.map((c) => escapeCell(c.value ? c.value(row) : row[c.key])).join(',')
    )
    return [header, ...lines].join('\r\n')
}

export function downloadBlob(blob, filename) {
    if (typeof document === 'undefined') return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
}
