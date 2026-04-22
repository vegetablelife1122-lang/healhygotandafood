import type { RankedRestaurant } from "./types";

// ひらがな・カタカナ・大小英字を統一してあいまい検索を可能にする
export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    // カタカナ → ひらがな
    .replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickRandomRestaurant(ranked: RankedRestaurant[]): RankedRestaurant {
  const top = ranked.slice(0, 8);
  return pickRandom(top.length > 0 ? top : ranked);
}

export function formatCalories(cal: number): string {
  if (cal === 0) return "カロリー表記なし";
  return `約 ${cal} kcal`;
}

export function healthScoreLabel(score: number): string {
  const labels = ["", "★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★"];
  return labels[score] ?? "";
}
