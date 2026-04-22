export type Area = "西五反田" | "東五反田" | "大崎";

export type VisitType = "ランチ" | "ディナー" | "軽く飲む" | "お酒メイン";

export type Genre =
  | "和食"
  | "洋食"
  | "イタリアン"
  | "中華"
  | "焼肉"
  | "居酒屋"
  | "ラーメン"
  | "カフェ"
  | "バー"
  | "ワインバー"
  | "その他";

export type Drink =
  | "ビール"
  | "ハイボール"
  | "レモンサワー"
  | "ワイン"
  | "日本酒"
  | "焼酎"
  | "カクテル"
  | "ソフトドリンク"
  | "飲まない"
  | "クラフトビール"
  | "ウイスキー"
  | "紹興酒"
  | "シェリー酒"
  | "マッコリ";

export type HealthTag = "野菜多め" | "高たんぱく" | "揚げ物少なめ" | "揚げ物あり" | "軽め" | "低カロリー" | "魚介系" | "発酵食品" | "肉料理充実" | "こだわり食材";

export interface Restaurant {
  id: string;
  name: string;
  nameReading?: string;
  area: Area;
  visitTypes: VisitType[];
  genre: Genre;
  budget: string;
  budgetLunch?: string;
  estimatedCalories: number;
  drinkPairings: Drink[];
  description: string;
  reasonTags: string[];
  walkingMinutes: number;
  healthScore: 1 | 2 | 3 | 4 | 5;
  healthTags: HealthTag[];
  address: string;
  openingHours: string;
  imageUrl?: string;
  tabelogUrl?: string;
}

export interface Filters {
  name: string;
  area: Area | "";
  visitType: VisitType | "";
  maxCalories: number | null;
  genre: Genre | "";
  drink: Drink | "";
  preferHealthy: boolean;
  preferHighProtein: boolean;
  preferVegetable: boolean;
  preferLowFried: boolean;
}

export interface RankedRestaurant {
  restaurant: Restaurant;
  score: number;
  reason: string;
  isRelaxed: boolean;
}
