import catalog from "./entities-catalog.json";
import { postcards } from "./postcards";
export const entities = catalog
  .map((entity) => ({
    ...entity,
    postcardId: postcards[entity.slug]?.id ?? null,
    available: !!postcards[entity.slug],
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));
export function searchEntities(query: string) {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  const q = normalize(query);
  return entities.filter((e) =>
    [e.name, ...e.aliases].some((s) => normalize(s).includes(q)),
  );
}
