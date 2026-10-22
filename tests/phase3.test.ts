import { describe, it, expect } from "vitest";
import { datasets } from "../src/data";
import { orderedPostcards } from "../src/content/postcards";
import { entities, searchEntities } from "../src/content/entities";
import {
  resolveQuestion,
  evaluateAnswer,
  percentagePoints,
} from "../src/features/postcard/answers";
import { validateDataset } from "../src/data/schema";
import {
  emptyAlbum,
  albumReducer,
  parseAlbum,
  loadAlbum,
  saveAlbum,
  STORAGE_KEY,
} from "../src/features/album/storage";
const known = orderedPostcards.map((c) => c.id);
describe("Colección completa", () => {
  it("32 entidades, claves, slugs y postales únicos", () => {
    for (const list of [
      entities.map((e) => e.id),
      entities.map((e) => e.slug),
      known,
    ]) {
      expect(list).toHaveLength(32);
      expect(new Set(list).size).toBe(32);
    }
    expect(entities.every((e) => e.available)).toBe(true);
    expect(Object.keys(datasets)).toHaveLength(32);
  });
  it("mantiene las cinco familias de preguntas", () =>
    expect(new Set(orderedPostcards.map((c) => c.question.type)).size).toBe(5));
  for (const card of orderedPostcards) {
    it(`${card.entityName}: datos, respuesta única y feedback verificables`, () => {
      const data = datasets[card.datasetId];
      expect(data.entityId).toBe(card.entityId);
      expect(data.year).toBe(2024);
      validateDataset(data);
      const result = resolveQuestion(card.question, data);
      expect(new Set(result.options.map((o) => o.id)).size).toBe(
        result.options.length,
      );
      expect(
        result.options.filter((o) => evaluateAnswer(card.question, data, o.id)),
      ).toHaveLength(1);
      expect(evaluateAnswer(card.question, data, result.correctId)).toBe(true);
      expect(() => evaluateAnswer(card.question, data, "invalid")).toThrow();
      expect(result.explanation).toContain(
        card.entityName === "Jalisco"
          ? "Jalisco"
          : card.question.type === "gap"
            ? "puntos porcentuales"
            : card.question.type === "compare"
              ? "tasas"
              : card.entityName,
      );
      expect(data.observations.map((o) => o.id)).toEqual([
        "18-19",
        "20-24",
        "25-29",
      ]);
      for (const o of data.observations) {
        expect(o.ratePct).toBeGreaterThanOrEqual(0);
        expect(o.ratePct).toBeLessThanOrEqual(100);
        expect(o.nonSpecifiedPct).toBeGreaterThanOrEqual(0);
        expect(o.nonSpecifiedPct).toBeLessThanOrEqual(100);
        expect(o.source?.originalSha256).toMatch(/^[a-f0-9]{64}$/);
        expect(o.counts?.notVoted).toBeNull();
      }
    });
  }
  it("Jalisco conserva cifras y respuesta del MVP", () => {
    const c = orderedPostcards.find((c) => c.id === "jalisco")!,
      d = datasets[c.datasetId];
    expect(d.observations.map((o) => o.ratePct)).toEqual([54.8, 47.6, 46.6]);
    expect(resolveQuestion(c.question, d).correctId).toBe("18-19");
  });
  it("BCS compara correctamente 38.6 y 40.6", () => {
    const c = orderedPostcards.find((c) => c.id === "baja-california-sur")!;
    expect(resolveQuestion(c.question, datasets[c.datasetId]).correctId).toBe(
      "no",
    );
  });
  it("distingue puntos porcentuales", () =>
    expect(percentagePoints(54.8, 46.6)).toBe(8.2));
  it("búsqueda sin acentos y con alias", () => {
    expect(searchEntities("michoacan")).toHaveLength(1);
    expect(searchEntities("edomex")[0].name).toBe("Estado de México");
    expect(searchEntities("cdmx")[0].id).toBe("09");
    expect(searchEntities("zzzzz")).toEqual([]);
  });
});
describe("Álbum y progreso de 32", () => {
  it("guardar todas, serializar, recargar y quitar preserva descubrimiento", () => {
    let state = emptyAlbum();
    for (const id of known)
      state = albumReducer(state, { type: "save", id }, known);
    expect(state.savedIds).toHaveLength(32);
    const loaded = parseAlbum(JSON.stringify(state), known);
    expect(loaded).toEqual(state);
    const next = albumReducer(loaded, { type: "remove", id: "jalisco" }, known);
    expect(next.savedIds).toHaveLength(31);
    expect(next.exploredIds).toHaveLength(32);
  });
  it("descubrir no guarda; volver a descubrir no suma", () => {
    const a = albumReducer(
      emptyAlbum(),
      { type: "explore", id: "jalisco" },
      known,
    );
    expect(a.savedIds).toEqual([]);
    expect(albumReducer(a, { type: "explore", id: "jalisco" }, known)).toBe(a);
  });
  it("conserva el álbum v1 del MVP", () =>
    expect(
      parseAlbum(
        '{"schemaVersion":1,"savedIds":["jalisco"],"exploredIds":["jalisco"]}',
        known,
      ).savedIds,
    ).toEqual(["jalisco"]));
  it("filtra desconocidos y duplicados", () =>
    expect(
      parseAlbum(
        '{"schemaVersion":1,"savedIds":["jalisco","jalisco","otro"],"exploredIds":[]}',
        known,
      ).savedIds,
    ).toEqual(["jalisco"]));
  it.each(["{", "null", "{}", '{"schemaVersion":2}'])(
    "recupera corrupción %s",
    (raw) =>
      expect(
        loadAlbum({ getItem: () => raw, setItem: () => {} }, known).issue,
      ).toBeTruthy(),
  );
  it("degrada a memoria ante bloqueo o cuota", () => {
    expect(loadAlbum(undefined, known).issue).toBeTruthy();
    expect(
      saveAlbum(
        {
          getItem: () => null,
          setItem: () => {
            throw Error("quota");
          },
        },
        emptyAlbum(),
      ),
    ).toBe(false);
  });
  it("persiste y restaura con la misma clave", () => {
    const map = new Map<string, string>(),
      storage = {
        getItem: (k: string) => map.get(k) ?? null,
        setItem: (k: string, v: string) => {
          map.set(k, v);
        },
      };
    const a = albumReducer(
      emptyAlbum(),
      { type: "save", id: "jalisco" },
      known,
    );
    expect(saveAlbum(storage, a)).toBe(true);
    expect(map.has(STORAGE_KEY)).toBe(true);
    expect(loadAlbum(storage, known).snapshot).toEqual(a);
  });
});

describe("Guardas de validación", () => {
  const fixture = () => structuredClone(datasets["jalisco-2024"]);
  it("rechaza porcentaje no especificado fuera de rango", () => {
    const d = fixture();
    d.observations[0].nonSpecifiedPct = 101;
    expect(() => validateDataset(d)).toThrow();
  });
  it("rechaza grupos duplicados", () => {
    const d = fixture();
    d.observations[1] = d.observations[0];
    expect(() => validateDataset(d)).toThrow();
  });
  it("rechaza superposición de edades", () => {
    const d = fixture();
    d.observations[1].ageMin = 19;
    expect(() => validateDataset(d)).toThrow();
  });
  it("no confunde confirmación del equipo con cotejo de originales", () => {
    const d = fixture();
    d.provenance = {
      ...d.provenance,
      status: "verified",
      sourceKind: "official-export",
      downloadedAt: "2026-10-22",
      verifiedAt: "2026-10-22",
      verifiedBy: "revisor de prueba",
    };
    d.observations[0].source!.originalFile = null;
    expect(() => validateDataset(d)).toThrow(/originales/);
  });
});
