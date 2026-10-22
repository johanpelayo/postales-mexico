import { validateCounts } from "./participation.mjs";
export const GROUPS = [
  [18, 19],
  [20, 24],
  [25, 29],
];
export function transformStates(rows, catalog, filename) {
  const canonical = (s) => (s === "México" ? "Estado de México" : s);
  if (
    rows.length !== 32 ||
    new Set(rows.map((r) => canonical(r.entidad))).size !== 32
  )
    throw new Error("Se requieren 32 entidades únicas.");
  if (rows.some((r) => r.anio !== "2024"))
    throw new Error("Año distinto de 2024.");
  const validNames = new Set(catalog.map((c) => c.name));
  if (rows.some((r) => !validNames.has(canonical(r.entidad))))
    throw new Error("Entidad desconocida.");
  return catalog.map((c) => {
    const r = rows.find((r) => canonical(r.entidad) === c.name);
    if (!r) throw new Error(`Falta ${c.name}`);
    const number = (key, optional = false) => {
      if (r[key] === undefined || r[key].trim() === "") {
        if (optional) return null;
        throw new Error(`Columna ausente: ${key}`);
      }
      const n = Number(r[key]);
      if (!Number.isFinite(n)) throw new Error(`Número inválido: ${key}`);
      return n;
    };
    const diagnostics = [];
    const observations = GROUPS.map(([ageMin, ageMax]) => {
      const group = `${ageMin}_${ageMax}`,
        column = `participacion_${group}_pct`,
        ratePct = number(column);
      const counts = {
        registered: number(`lista_nominal_${group}`),
        voted: number(`si_votaron_${group}`),
        notVoted: number(`no_votaron_${group}`, true),
        nonSpecified: number(`no_especificados_${group}`, true),
      };
      const nonSpecifiedPct = number(`no_especificados_${group}_pct`, true);
      diagnostics.push({
        groupId: `${ageMin}-${ageMax}`,
        ...validateCounts(counts, ratePct, nonSpecifiedPct),
      });
      return {
        id: `${ageMin}-${ageMax}`,
        ageMin,
        ageMax,
        ratePct,
        nonSpecifiedPct,
        counts,
        source: {
          file: filename,
          row: rows.indexOf(r) + 2,
          column,
          groupEvidence: `Cabecera explícita ${column}; no se deduce el filtro por parecido de tasas.`,
          originalFile: null,
        },
      };
    });
    for (const [a, b] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      const key = `dif_${observations[a].id.replace("-", "_")}_vs_${observations[b].id.replace("-", "_")}_pp`;
      if (
        Math.abs(
          number(key) -
            Math.round(
              (observations[a].ratePct - observations[b].ratePct) * 10,
            ) /
              10,
        ) > 0.001
      )
        throw new Error(`Diferencia incorrecta: ${c.name} ${key}`);
    }
    return { catalog: c, observations, diagnostics };
  });
}
