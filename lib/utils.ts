import type { RankedRestaurant } from "./types";

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
