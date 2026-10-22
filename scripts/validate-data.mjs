import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { importAll } from "./import-data.mjs";
const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const expected = importAll(),
  datasets = read("../src/data/states-2024.json"),
  audit = read("../src/data/import-audit.json"),
  catalog = read("../src/content/entities-catalog.json");
assert.deepEqual(
  datasets,
  expected.datasets,
  "El JSON debe regenerarse desde la fuente, sin ediciones de cifras.",
);
assert.deepEqual(audit, expected.audit);
assert.equal(datasets.length, 32);
assert.equal(new Set(datasets.map((d) => d.entityId)).size, 32);
assert.equal(new Set(catalog.map((c) => c.slug)).size, 32);
assert.equal(new Set(catalog.map((c) => c.id)).size, 32);
for (const d of datasets) {
  assert.equal(d.year, 2024);
  assert.equal(d.observations.length, 3);
  assert.equal(
    d.provenance.denominator,
    "Sí votaron + No votaron; excluye registros de voto no especificado",
  );
}
if (process.env.REQUIRE_VERIFIED_DATA === "1") {
  assert.ok(
    datasets.every((d) => d.provenance.status === "verified"),
    "Faltan datos verificados.",
  );
}
console.log(
  "32 entidades únicas, 96 tasas, año, edades, fuente/hash, diferencias y JSON reproducible: correctos.",
);
console.log(
  `Originales cotejados: 96 tasas y 96 porcentajes no especificados. No especificados sin fuente: ${audit.missingNonSpecifiedPercentages}. Conteos ausentes nunca estimados.`,
);

assert.equal(audit.originalsAvailable, true);
assert.equal(audit.missingNonSpecifiedPercentages, 0);
assert.equal(audit.sourceFiles.length, 3);
assert.equal(audit.entities.flatMap(e=>e.diagnostics).length, 96);
assert.ok(audit.entities.every(e=>e.diagnostics.every(d=>d.arithmeticCheck==='rounded-compatible')));
for(const d of datasets) for(const o of d.observations) {
 assert.match(o.source.originalSha256, /^[a-f0-9]{64}$/);
 assert.ok(o.nonSpecifiedPct >= 0 && o.nonSpecifiedPct <= 100);
 assert.equal(o.counts.notVoted, null);
 assert.equal(o.counts.nonSpecified, null);
}
