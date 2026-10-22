export const percentage = (value: number) =>
  `${new Intl.NumberFormat("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}%`;
export const ageLabel = (min: number, max: number) => `${min}–${max} años`;
export const assetUrl = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
