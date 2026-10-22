import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseCsv } from "../scripts/csv.mjs";
import { transformStates } from "../scripts/transform-data.mjs";
import { validateCounts } from "../scripts/participation.mjs";
const filename = "INE_comparativo_estatal_18-29_2024 (1).csv";
const rows = parseCsv(
  readFileSync(new URL(`../data/raw/${filename}`, import.meta.url), "utf8"),
);
const catalog = JSON.parse(
  readFileSync(
    new URL("../src/content/entities-catalog.json", import.meta.url),
  ),
);
const transform = (r) => transformStates(r, catalog, filename);
describe("Importación y denominador oficial", () => {
  it("BOM, CRLF y comillas", () =>
    expect(parseCsv('\uFEFFa,b\r\n"uno,dos","tres""cuatro"\r\n')).toEqual([
      { a: "uno,dos", b: 'tres"cuatro' },
    ]));
  it.each(["a,b\nx", 'a,b\n"ab', "a,a\n1,2", 'a,b\n"a"x,2'])(
    "rechaza CSV inválido %s",
    (s) => expect(() => parseCsv(s)).toThrow(),
  );
  it("32 entidades independientes del orden de filas", () =>
    expect(transform([...rows].reverse()).map((d) => d.observations)).toEqual(
      transform(rows).map((d) =>
        d.observations.map((o) => ({
          ...o,
          source: { ...o.source, row: 33 - o.source.row + 2 },
        })),
      ),
    )); // row reference changes with file ordering
  it("96 porcentajes preservados y ningún conteo reconstruido", () => {
    const all = transform(rows);
    expect(all).toHaveLength(32);
    expect(
      all
        .flatMap((d) => d.diagnostics)
        .every((d) => d.arithmeticCheck === "not-checkable"),
    ).toBe(true);
    expect(
      all
        .flatMap((d) => d.observations)
        .every((o) => o.nonSpecifiedPct === null && o.counts.notVoted === null),
    ).toBe(true);
  });
  it("excluye no especificados del denominador: 60/(60+30), no 60/100", () => {
    const r = validateCounts(
      { registered: 100, voted: 60, notVoted: 30, nonSpecified: 10 },
      66.7,
      10,
    );
    expect(r.denominator).toBe(90);
    expect(r.calculatedRate).toBeCloseTo(66.6667, 4);
    expect(r.arithmeticCheck).toBe("passed");
  });
  it("no inventa No votaron cuando falta", () =>
    expect(
      validateCounts({ registered: 100, voted: 60 }, 66.7).calculatedRate,
    ).toBeNull());
  it("rechaza tasa calculada con denominador equivocado cuando hay conteos exactos", () =>
    expect(() =>
      validateCounts(
        { registered: 100, voted: 60, notVoted: 30, nonSpecified: 10 },
        60,
        10,
      ),
    ).toThrow());
  it("rechaza total incoherente", () =>
    expect(() =>
      validateCounts(
        { registered: 100, voted: 60, notVoted: 30, nonSpecified: 20 },
        66.7,
      ),
    ).toThrow());
  it("rechaza no especificados incorrectos", () =>
    expect(() =>
      validateCounts(
        { registered: 100, voted: 60, notVoted: 30, nonSpecified: 10 },
        66.7,
        20,
      ),
    ).toThrow());
  it.each([NaN, -1, 101])("rechaza porcentaje no especificado %s", (p) =>
    expect(() =>
      validateCounts({ registered: 100, voted: 60 }, 66.7, p),
    ).toThrow(),
  );
  it("rechaza entidad desconocida", () =>
    expect(() =>
      transform(rows.map((r, i) => (i ? r : { ...r, entidad: "Otra" }))),
    ).toThrow());
  it("rechaza duplicado", () =>
    expect(() => transform([...rows.slice(0, 31), rows[0]])).toThrow());
  it("rechaza año incorrecto", () =>
    expect(() =>
      transform(rows.map((r) => ({ ...r, anio: "2021" }))),
    ).toThrow());
  it("rechaza tasa vacía sin convertirla en cero", () =>
    expect(() =>
      transform(
        rows.map((r) =>
          r.entidad === "Jalisco" ? { ...r, participacion_18_19_pct: "" } : r,
        ),
      ),
    ).toThrow());
  it("rechaza diferencia incorrecta", () =>
    expect(() =>
      transform(
        rows.map((r) =>
          r.entidad === "Jalisco" ? { ...r, dif_18_19_vs_20_24_pp: "70" } : r,
        ),
      ),
    ).toThrow());
});

describe("Campos opcionales preservados sin estimar", () => {
  it("incorpora porcentaje no especificado cero y conteos exactos si existen en la fuente", () => {
    const updated = rows.map((r) =>
      r.entidad === "Jalisco"
        ? {
            ...r,
            lista_nominal_18_19: "1000",
            si_votaron_18_19: "548",
            no_votaron_18_19: "452",
            no_especificados_18_19: "0",
            no_especificados_18_19_pct: "0",
          }
        : r,
    );
    const state = transform(updated).find((s) => s.catalog.slug === "jalisco");
    expect(state.observations[0].nonSpecifiedPct).toBe(0);
    expect(state.observations[0].counts.notVoted).toBe(452);
    expect(state.diagnostics[0].arithmeticCheck).toBe("passed");
  });
});
