import raw from "./states-2024.json";
import { validateDataset } from "./schema";
import type { ElectoralDataset } from "./types";
export const datasets: Record<string, ElectoralDataset> = Object.fromEntries(
  raw.map((value) => {
    validateDataset(value);
    return [value.id, value];
  }),
);
