import type { RankedRestaurant } from "@/lib/types";
import { formatCalories, healthScoreLabel, getPeakHourWarnings } from "@/lib/utils";

interface RestaurantCardProps {
  ranked: RankedRestaurant;
  rank: number;
  isSelected: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const HEALTH_TAG_COLORS: Record<string, string> = {
  "野菜多め": "bg-green-100 text-green-700",
  "高たんぱく": "bg-blue-100 text-blue-700",
  "揚げ物少なめ": "bg-yellow-100 text-yellow-700",
  "軽め": "bg-purple-100 text-purple-700",
  "低カロリー": "bg-teal-100 text-teal-700",
  "魚介系": "bg-cyan-100 text-cyan-700",
  "発酵食品": "bg-orange-100 text-orange-700",
};

const VISIT_TYPE_COLORS: Record<string, string> = {
  "ランチ": "bg-amber-100 text-amber-700",
  "ディナー": "bg-indigo-100 text-indigo-700",
  "軽く飲む": "bg-pink-100 text-pink-700",
  "お酒メイン": "bg-red-100 text-red-700",
};

export default function RestaurantCard({ ranked, rank, isSelected, isFavorite = false, onToggleFavorite }: RestaurantCardProps) {
  const { restaurant, reason, isRelaxed } = ranked;
  const peakWarnings = getPeakHourWarnings(restaurant);

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-5 border-2 transition-all ${
        isSelected ? "border-green-500 ring-2 ring-green-200" : isFavorite ? "border-yellow-400 ring-2 ring-yellow-100" : "border-transparent"
      }`}
    >
      {/* Rank badge + name + heart */}
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-sm font-bold shadow">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 leading-tight">{restaurant.name}</h3>
          {isRelaxed && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
              カロリー条件を少し緩めた候補
            </span>
          )}
        </div>
        {/* お気に入りボタン */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(restaurant.id)}
            className="flex-shrink-0 text-2xl leading-none transition-transform hover:scale-125 active:scale-110"
            aria-label={isFavorite ? "お気に入りを解除" : "お気に入りに追加"}
          >
            {isFavorite ? "🌟" : "☆"}
          </button>
        )}
      </div>

      {/* Area + Genre badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
          {restaurant.area}
        </span>
        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full font-medium border border-green-200">
          {restaurant.genre}
        </span>
        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">
          徒歩 {restaurant.walkingMinutes}分
        </span>
      </div>

      {/* Visit types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {restaurant.visitTypes.map((vt) => (
          <span
            key={vt}
            className={`px-2 py-0.5 text-xs rounded-full font-medium ${VISIT_TYPE_COLORS[vt] ?? "bg-gray-100 text-gray-600"}`}
          >
            {vt}
          </span>
        ))}
      </div>

      {/* Budget and Calories */}
      <div className="flex flex-wrap gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-500 text-xs">予算</span>
          {restaurant.budgetLunch ? (
            <div className="font-semibold text-gray-800 text-xs leading-5">
              <span className="text-gray-400">ランチ </span>{restaurant.budgetLunch}<br />
              <span className="text-gray-400">夜 &nbsp;&nbsp;&nbsp;&nbsp;</span>{restaurant.budget}
            </div>
          ) : (
            <p className="font-semibold text-gray-800">{restaurant.budget}</p>
          )}
        </div>
        <div>
          <span className="text-gray-500 text-xs">カロリー目安</span>
          <p className="font-semibold text-gray-800">{formatCalories(restaurant.estimatedCalories)}</p>
        </div>
        <div>
          <span className="text-gray-500 text-xs">健康スコア</span>
          <p className="font-semibold text-yellow-500 text-sm">{healthScoreLabel(restaurant.healthScore)}</p>
        </div>
      </div>

      {/* Health tags */}
      {restaurant.healthTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {restaurant.healthTags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${HEALTH_TAG_COLORS[tag] ?? "bg-gray-100 text-gray-600"}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Drink pairings */}
      {restaurant.drinkPairings.length > 0 && (
        <div className="mb-3">
          <span className="text-xs text-gray-500 mr-1">お酒：</span>
          {restaurant.drinkPairings.map((d) => (
            <span key={d} className="inline-block mr-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{restaurant.description}</p>

      {/* Photo */}
      {restaurant.imageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={`${restaurant.name}の写真`}
            className="w-full h-40 object-cover"
          />
        </div>
      )}

      {/* Peak hour warnings */}
      {peakWarnings.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {peakWarnings.map((w) => (
            <span key={w} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-200 font-medium">
              ⚠️ {w}
            </span>
          ))}
        </div>
      )}

      {/* Address & Hours */}
      <div className="mb-3 space-y-1 text-xs text-gray-500">
        <p>📍 {restaurant.address}</p>
        <p>🕐 {restaurant.openingHours}</p>
      </div>

      {/* Tabelog link */}
      {restaurant.tabelogUrl && (
        <a
          href={restaurant.tabelogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mb-3 px-3 py-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
        >
          🍽️ 食べログで見る →
        </a>
      )}

      {/* Reason */}
      <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-100">
        <p className="text-xs text-gray-500 mb-0.5">選ばれた理由</p>
        <p className="text-sm text-green-800 font-medium">{reason}</p>
      </div>
    </div>
  );
}
