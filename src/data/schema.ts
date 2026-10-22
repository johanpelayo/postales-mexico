import type { ElectoralDataset } from "./types";

export function validateDataset(
  value: unknown,
): asserts value is ElectoralDataset {
  if (!value || typeof value !== "object")
    throw new Error("Falta el conjunto de datos.");
  const d = value as ElectoralDataset;
  if (!d.id || !d.entityId || !d.entityName || !Number.isInteger(d.year))
    throw new Error("Entidad o año ausentes.");
  if (!Array.isArray(d.observations) || d.observations.length < 2)
    throw new Error("Faltan grupos de edad.");
  const ids = new Set<string>();
  for (const row of d.observations) {
    if (!row.id || ids.has(row.id))
      throw new Error("Grupo duplicado o sin identificador.");
    ids.add(row.id);
    if (
      !Number.isInteger(row.ageMin) ||
      !Number.isInteger(row.ageMax) ||
      row.ageMin > row.ageMax ||
      row.ageMin < 18
    )
      throw new Error("Grupo de edad inválido.");
    if (
      typeof row.ratePct !== "number" ||
      !Number.isFinite(row.ratePct) ||
      row.ratePct < 0 ||
      row.ratePct > 100
    )
      throw new Error("Tasa ausente o fuera de rango.");
  }
  if (
    d.observations.some(
      (o) =>
        o.nonSpecifiedPct != null &&
        (!Number.isFinite(o.nonSpecifiedPct) ||
          o.nonSpecifiedPct < 0 ||
          o.nonSpecifiedPct > 100),
    )
  )
    throw new Error("Porcentaje no especificado inválido.");
  const sorted = [...d.observations].sort((a, b) => a.ageMin - b.ageMin);
  if (sorted.some((row, i) => i > 0 && row.ageMin <= sorted[i - 1].ageMax))
    throw new Error("Grupos de edad superpuestos.");
  if (
    !d.provenance ||
    !["pending", "team-confirmed", "verified"].includes(d.provenance.status)
  )
    throw new Error("Falta el estado de verificación.");
  if (d.provenance.status === "verified") {
    const p = d.provenance;
    if (
      p.sourceKind !== "official-export" ||
      !p.rawFile ||
      !p.sha256 ||
      !/^[a-f0-9]{64}$/i.test(p.sha256) ||
      (!p.downloadedAt && !p.receivedAt) ||
      !p.indicator ||
      !p.denominator ||
      !p.filters ||
      !p.verifiedBy ||
      !p.verifiedAt
    )
      throw new Error(
        "Procedencia incompleta: no puede marcarse como verificado.",
      );
    if (
      d.observations.some(
        (row) => !row.source?.originalFile || row.nonSpecifiedPct == null,
      )
    )
      throw new Error(
        "Faltan originales por grupo o porcentaje no especificado.",
      );
    const source = new URL(p.officialUrl);
    if (
      source.protocol !== "https:" ||
      !(source.hostname === "ine.mx" || source.hostname.endsWith(".ine.mx"))
    )
      throw new Error("La referencia oficial debe pertenecer al INE.");
  }
}

export function validateJaliscoDataset(
  value: unknown,
): asserts value is ElectoralDataset {
  validateDataset(value);
  if (
    value.entityId !== "14" ||
    value.entityName !== "Jalisco" ||
    value.year !== 2024
  )
    throw new Error("Se esperaba Jalisco, entidad 14, año 2024.");
  const expected = ["18-19", "20-24", "25-29"];
  if (
    value.observations.length !== 3 ||
    expected.some(
      (id) =>
        !value.observations.some(
          (row) => row.id === id && row.id === `${row.ageMin}-${row.ageMax}`,
        ),
    )
  )
    throw new Error("Los grupos no corresponden al piloto.");
}
