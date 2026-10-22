/** Strict RFC-4180 reader, including BOM, CRLF and escaped quotes. */
export function parseCsv(text, delimiter = ",") {
  if (delimiter.length !== 1 || /["\r\n]/.test(delimiter)) throw new Error("Delimitador inválido.");
  const rows = [];
  let row = [],
    field = "",
    quoted = false,
    closed = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else field += c;
    } else if (c === delimiter || c === "\n" || c === "\r") {
      row.push(field);
      field = "";
      closed = false;
      if (c !== delimiter) {
        if (c === "\r" && text[i + 1] === "\n") i++;
        rows.push(row);
        row = [];
      }
    } else if (c === '"' && !field && !closed) quoted = true;
    else {
      if (closed || c === '"') throw new Error("CSV: comillas inválidas.");
      field += c;
    }
  }
  if (quoted) throw new Error("CSV: campo sin cerrar.");
  if (field || row.length || closed) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift();
  if (!headers || new Set(headers).size !== headers.length)
    throw new Error("CSV: cabecera inválida.");
  return rows
    .filter((r) => r.some(Boolean))
    .map((r, i) => {
      if (r.length !== headers.length)
        throw new Error(`CSV: fila ${i + 2} incompleta.`);
      return Object.fromEntries(headers.map((h, j) => [h, r[j]]));
    });
}
