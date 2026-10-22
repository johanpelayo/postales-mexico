import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve("dist"),
  html = readFileSync(resolve(root, "index.html"), "utf8");
const base = process.env.VITE_BASE_PATH || "/";
for (const [, url] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  assert.ok(url.startsWith(base), `Ruta fuera de la base: ${url}`);
  assert.ok(
    existsSync(resolve(root, url.slice(base.length))),
    `Recurso ausente: ${url}`,
  );
}
for (const name of readdirSync(resolve(root, "assets")).filter((f) =>
  f.endsWith(".css"),
)) {
  const css = readFileSync(resolve(root, "assets", name), "utf8");
  for (const [, url] of css.matchAll(/url\(([^)]+)\)/g)) {
    const path = url.replace(/['"]/g, "");
    if (path.startsWith("data:")) continue;
    const local = path.startsWith(base)
      ? resolve(root, path.slice(base.length))
      : resolve(root, "assets", path);
    assert.ok(existsSync(local), `Fuente o recurso CSS ausente: ${path}`);
  }
}
const image = readFileSync(resolve(root, "assets/jalisco.jpg"));
assert.equal(
  image.readUInt16BE(0),
  0xffd8,
  "La ilustración debe ser un JPEG válido, no una página HTML.",
);
for (const font of ["Literata", "IBM-Plex-Sans", "IBM-Plex-Mono"])
  assert.ok(
    readFileSync(resolve(root, `licenses/${font}-OFL.txt`)).length > 100,
  );
assert.ok(!existsSync(resolve(root, "tests")), "No publicar el visor de QA.");
console.log(
  `Build estático: referencias HTML/CSS, fuentes, licencias e imagen correctas; base ${base}`,
);
const cards = JSON.parse(
  readFileSync(resolve("src/content/postcards.json"), "utf8"),
);
for (const card of Object.values(cards))
  assert.ok(
    existsSync(resolve(root, card.artwork)),
    `Imagen ausente de ${card.entityName}`,
  );
console.log("Recursos de las 32 postales: presentes.");
