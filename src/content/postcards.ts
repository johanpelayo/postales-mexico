import raw from "./postcards.json";
import type { PostcardContent } from "../data/types";
export const postcards = raw as Record<string, PostcardContent>;
export const postcardIds = Object.keys(postcards);
export const orderedPostcards = Object.values(postcards).sort(
  (a, b) => Number(a.number) - Number(b.number),
);
