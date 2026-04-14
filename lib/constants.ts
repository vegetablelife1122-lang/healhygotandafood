import type { Area, VisitType, Genre, Drink } from "./types";

export const AREAS: Area[] = ["西五反田", "東五反田"];

export const VISIT_TYPES: VisitType[] = ["ランチ", "ディナー", "軽く飲む", "お酒メイン"];

export const GENRES: Genre[] = [
  "和食", "洋食", "イタリアン", "中華", "焼肉",
  "居酒屋", "ラーメン", "カフェ", "バー", "その他",
];

export const DRINKS: Drink[] = [
  "ビール", "ハイボール", "レモンサワー", "ワイン",
  "日本酒", "焼酎", "カクテル", "ソフトドリンク", "飲まない",
];

export const CALORIE_PRESETS = [500, 700, 900, 1200, 1500] as const;

export const SCORE_WEIGHTS = {
  NAME_MATCH: 30,
  AREA_MATCH: 30,
  VISIT_TYPE_MATCH: 25,
  CALORIE_OK: 25,
  CALORIE_RELAXED: 10,
  DRINK_MATCH: 25,
  GENRE_MATCH: 15,
  HEALTH_TAG_MATCH: 10,
  HEALTH_SCORE_BASE: 5,
  WALKING_BONUS: 5,
} as const;

export const MAX_RESULTS = 8;
export const MIN_RESULTS = 3;
export const CALORIE_RELAX_MARGIN = 200;
