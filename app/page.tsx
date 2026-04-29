"use client";

import { useState, useRef } from "react";
import type { Filters, RankedRestaurant } from "@/lib/types";
import { rankRestaurants } from "@/lib/scoring";
import { pickRandomRestaurant, calcDistance } from "@/lib/utils";
import { restaurants } from "@/data/restaurants";
import FilterForm from "@/components/FilterForm";
import RestaurantCard from "@/components/RestaurantCard";
import DecisionCard from "@/components/DecisionCard";
import { playRandomFanfare, playHazure } from "@/lib/sounds";
import { useFavorites } from "@/lib/useFavorites";

const HAZURE_ITEMS = [
  {
    store: "セブンイレブン",
    name: "昆布おにぎり",
    tag: "おにぎり",
    price: "¥150〜250",
    kcal: "約 170 kcal",
    score: "★★☆☆☆",
    desc: "五反田のセブンイレブンの定番おにぎり。北海道産昆布使用。塩分控えめで低カロリー。忙しい日のランチにも最適。",
    tags: ["低カロリー", "軽め"],
  },
  {
    store: "セブンイレブン",
    name: "サラダチキン（プレーン）",
    tag: "サラダチキン",
    price: "¥250〜300",
    kcal: "約 110 kcal",
    score: "★★★★☆",
    desc: "高タンパク・低カロリーの定番。ダイエット中の強い味方。",
    tags: ["高タンパク", "低カロリー", "ダイエット向け"],
  },
  {
    store: "セブンイレブン",
    name: "野菜スティック",
    tag: "野菜",
    price: "¥150〜200",
    kcal: "約 170 kcal",
    score: "★★★☆☆",
    desc: "こうじ味噌マヨ込みで170kcal。野菜だからヘルシーとは言ってない。",
    tags: ["超低カロリー", "野菜", "ヘルシー"],
  },
];

const HAZURE_REASONS = [
  "今日はそういう日だったということで。",
  "昨日食べすぎたから。",
  "近いから。",
];

const DEFAULT_FILTERS: Filters = {
  name: "",
  area: "",
  visitType: "",
  maxCalories: null,
  genre: "",
  drink: "",
  preferHealthy: false,
  preferHighProtein: false,
  preferVegetable: false,
  preferLowFried: false,
  openNow: false,
  maxDistance: null,
};

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [results, setResults] = useState<RankedRestaurant[]>([]);
  const [selected, setSelected] = useState<RankedRestaurant | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isHazure, setIsHazure] = useState(false);
  const [hazureReason, setHazureReason] = useState("");
  const [hazureItem, setHazureItem] = useState(HAZURE_ITEMS[0]);

  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const decisionRef = useRef<HTMLDivElement>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("このブラウザは位置情報に対応していません");
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError("位置情報の取得に失敗しました");
        setLocationLoading(false);
      }
    );
  };

  const displayedResults = (() => {
    let base = showFavoritesOnly
      ? results.filter((r) => isFavorite(r.restaurant.id))
      : results;
    if (userLocation && filters.maxDistance !== null) {
      base = base.filter((r) => {
        if (r.restaurant.lat == null || r.restaurant.lng == null) return true;
        return calcDistance(userLocation.lat, userLocation.lng, r.restaurant.lat, r.restaurant.lng) <= filters.maxDistance!;
      });
    }
    if (!userLocation) return base;
    return [...base].sort((a, b) => {
      const da = a.restaurant.lat != null && a.restaurant.lng != null
        ? calcDistance(userLocation.lat, userLocation.lng, a.restaurant.lat, a.restaurant.lng)
        : Infinity;
      const db = b.restaurant.lat != null && b.restaurant.lng != null
        ? calcDistance(userLocation.lat, userLocation.lng, b.restaurant.lat, b.restaurant.lng)
        : Infinity;
      return da - db;
    });
  })();

  const handleSubmit = () => {
    const ranked = rankRestaurants(restaurants, filters);
    setResults(ranked);
    setSelected(null);
    setHasSearched(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDecide = () => {
    const pool = showFavoritesOnly ? displayedResults : results;
    if (pool.length === 0) return;
    setSelected(null);
    setIsHazure(false);
    // 1/20でハズレ（コンビニのおにぎり）
    if (Math.random() < 1 / 20) {
      playHazure();
      setHazureReason(HAZURE_REASONS[Math.floor(Math.random() * HAZURE_REASONS.length)]);
      setHazureItem(HAZURE_ITEMS[Math.floor(Math.random() * HAZURE_ITEMS.length)]);
      setTimeout(() => {
        setIsHazure(true);
        setTimeout(() => {
          decisionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 300);
      return;
    }
    const pick = pickRandomRestaurant(pool);
    playRandomFanfare(() => {
      setSelected(pick);
      setTimeout(() => {
        decisionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
  };

  const handleRedraw = () => {
    const pool = showFavoritesOnly ? displayedResults : results;
    if (pool.length === 0) return;
    setIsHazure(false);
    const pick = pickRandomRestaurant(pool);
    setSelected(pick);
    playRandomFanfare();
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="relative text-white overflow-hidden shadow-lg">
        {/* 背景フード写真 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1400&q=80')",
          }}
        />
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-black/20 to-emerald-950/55" />

        {/* 山手線高架＋建物シルエット — ヘッダー下部 */}
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          viewBox="0 0 800 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
        >
          {/* 左側 高層ビル群（高さランダム） */}
          <rect x="0"   y="10" width="30" height="80" fill="white" opacity="0.14"/>
          <rect x="34"  y="30" width="26" height="60" fill="white" opacity="0.12"/>
          <rect x="64"  y="0"  width="28" height="90" fill="white" opacity="0.15"/>
          <rect x="68"  y="-4" width="8"  height="6"  fill="white" opacity="0.11"/>
          <rect x="96"  y="22" width="24" height="68" fill="white" opacity="0.11"/>
          <rect x="124" y="45" width="20" height="45" fill="white" opacity="0.09"/>
          <rect x="148" y="15" width="26" height="75" fill="white" opacity="0.13"/>
          <rect x="178" y="55" width="18" height="35" fill="white" opacity="0.08"/>
          <rect x="200" y="38" width="22" height="52" fill="white" opacity="0.10"/>

          {/* 右側 高層ビル群（高さランダム） */}
          <rect x="578" y="38" width="22" height="52" fill="white" opacity="0.10"/>
          <rect x="604" y="55" width="18" height="35" fill="white" opacity="0.08"/>
          <rect x="626" y="15" width="26" height="75" fill="white" opacity="0.13"/>
          <rect x="656" y="45" width="20" height="45" fill="white" opacity="0.09"/>
          <rect x="680" y="22" width="24" height="68" fill="white" opacity="0.11"/>
          <rect x="708" y="0"  width="28" height="90" fill="white" opacity="0.15"/>
          <rect x="712" y="-4" width="8"  height="6"  fill="white" opacity="0.11"/>
          <rect x="740" y="30" width="26" height="60" fill="white" opacity="0.12"/>
          <rect x="770" y="10" width="30" height="80" fill="white" opacity="0.14"/>

          {/* 高架の柱 */}
          {[240, 290, 340, 390, 440, 490, 540].map((x) => (
            <rect key={x} x={x} y="52" width="6" height="38" fill="white" opacity="0.25" rx="1"/>
          ))}
          {/* 高架の梁（横） */}
          <rect x="237" y="48" width="312" height="7" fill="white" opacity="0.30" rx="2"/>
          {/* レール */}
          <rect x="235" y="44" width="316" height="2.5" fill="white" opacity="0.45" rx="1"/>
          <rect x="235" y="50" width="316" height="1.5" fill="white" opacity="0.35" rx="1"/>
          {/* 架線（電線） */}
          <path d="M 235 38 Q 268 34 290 38 Q 318 34 340 38 Q 368 34 390 38 Q 418 34 440 38 Q 468 34 490 38 Q 518 34 540 38 Q 551 34 551 38" stroke="white" strokeWidth="1" opacity="0.3"/>
        </svg>

        {/* テキスト */}
        <div className="relative py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                📍 五反田 · 品川区
              </span>
            </div>
            <p className="text-green-300 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Gotanda Healthy Eats</p>
            <h1 className="text-2xl font-black leading-tight mb-2 drop-shadow-lg">
              健康を気にする人のための<br />五反田外食決定機
            </h1>
            <p className="text-gray-300 text-xs leading-relaxed max-w-md mx-auto mb-1">
              カロリー・ジャンル・シーン・お酒の条件を選んで、<br />今日の自分にぴったりの1店を見つけよう。
            </p>
            <p className="text-white/50 text-xs">現在掲載店舗 214件</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Filter form */}
        <section>
          <FilterForm filters={filters} onChange={setFilters} onSubmit={handleSubmit} userLocation={userLocation} />
          {/* 現在地ボタン */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locationLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {locationLoading ? "取得中..." : userLocation ? "📍 現在地取得済み" : "📍 現在地を使って距離順に並べる"}
            </button>
            {userLocation && (
              <button
                type="button"
                onClick={() => setUserLocation(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                解除
              </button>
            )}
            {locationError && <span className="text-xs text-red-500">{locationError}</span>}
          </div>
        </section>

        {/* Results */}
        {hasSearched && (
          <section ref={resultsRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 whitespace-nowrap">
                健康を意識したおすすめ候補
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{results.length}件</span>
                {favorites.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowFavoritesOnly((v) => !v)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      showFavoritesOnly
                        ? "bg-yellow-400 text-white"
                        : "bg-yellow-50 text-yellow-600 border border-yellow-300"
                    }`}
                  >
                    🌟 お気に入り {favorites.size}件
                  </button>
                )}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <p className="text-gray-400 text-4xl mb-3">🔍</p>
                <p className="text-gray-600 font-medium">条件に合うお店が見つかりませんでした</p>
                <p className="text-gray-400 text-sm mt-1">条件を変えてもう一度試してみてください</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedResults.length === 0 && showFavoritesOnly ? (
                  <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                    <p className="text-gray-400 text-4xl mb-3">🤍</p>
                    <p className="text-gray-600 font-medium">この検索結果にお気に入りはありません</p>
                  </div>
                ) : (
                  displayedResults.map((ranked, index) => (
                    <RestaurantCard
                      key={ranked.restaurant.id}
                      ranked={ranked}
                      rank={index + 1}
                      isSelected={selected?.restaurant.id === ranked.restaurant.id}
                      isFavorite={isFavorite(ranked.restaurant.id)}
                      onToggleFavorite={toggleFavorite}
                      userLocation={userLocation}
                    />
                  ))
                )}
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleDecide}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black py-4 px-6 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl tracking-wide"
                >
                  今日の1店を決める！
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">
                  上位8件からランダムに1店を選びます
                </p>
              </div>
            )}
          </section>
        )}

        {/* Decision card */}
        {selected && (
          <section ref={decisionRef}>
            <DecisionCard ranked={selected} onRedraw={handleRedraw} />
          </section>
        )}

        {/* ハズレカード */}
        {isHazure && !selected && (
          <section ref={decisionRef}>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              {/* Header */}
              <div className="relative overflow-hidden px-6 pt-6 pb-8 bg-gray-800">
                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/seven-eleven.jpg.png')", backgroundPosition: "center 15%" }} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                <p className="absolute bottom-2 right-3 text-white/40 text-xs z-10">※写真はイメージです</p>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-green-200 text-xs font-semibold tracking-[0.25em] uppercase">Today&apos;s Pick</p>
                    {/* 7-ELEVEnロゴ風テキスト */}
                    <span className="inline-flex items-baseline bg-white rounded px-2 py-0.5 shadow-md select-none">
                      <span style={{ color: "#f47920", fontWeight: 900, fontSize: "1.1rem", fontFamily: "Arial Black, sans-serif", lineHeight: 1 }}>7</span>
                      <span style={{ color: "#c8102e", fontWeight: 900, fontSize: "1.1rem", fontFamily: "Arial Black, sans-serif", lineHeight: 1 }}>-</span>
                      <span style={{ color: "#006835", fontWeight: 900, fontSize: "0.85rem", fontFamily: "Arial Black, sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>ELEVE</span>
                      <span style={{ color: "#006835", fontWeight: 900, fontSize: "0.85rem", fontFamily: "Arial Black, sans-serif", lineHeight: 1, letterSpacing: "-0.02em" }}>n</span>
                    </span>
                  </div>
                  <h2 className="text-white text-2xl font-extrabold mb-2 leading-tight drop-shadow-lg">
                    今日の五反田外食はここ！
                  </h2>
                  <p className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg mb-4">
                    {hazureItem.store} {hazureItem.name === "サラダチキン（プレーン）" ? <><br />{hazureItem.name}</> : hazureItem.name}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">西五反田</span>
                    <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">{hazureItem.tag}</span>
                    <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">徒歩 1分</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white px-6 py-5 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">予算</p>
                    <p className="text-sm font-bold text-gray-800">{hazureItem.price}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">カロリー</p>
                    <p className="text-sm font-bold text-green-700">{hazureItem.kcal}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">健康スコア</p>
                    <p className="text-sm font-bold text-yellow-600">{hazureItem.score}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">{hazureItem.desc}</p>

                <div className="space-y-1 text-sm text-gray-500">
                  <p>📍 品川区西五反田 セブンイレブン西五反田店</p>
                  <p>🕐 24時間営業 / 年中無休</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {hazureItem.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs rounded-full font-semibold bg-teal-200 text-teal-800">{tag}</span>
                  ))}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500 font-semibold mb-1">選ばれた理由</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{hazureReason}</p>
                </div>

                <button
                  type="button"
                  onClick={handleRedraw}
                  className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-xl text-base transition-colors"
                >
                  もう一度引き直す
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-200 mt-8">
        <p>健康を気にする人のための五反田外食決定機</p>
        <p className="mt-1">掲載情報はサンプルデータです</p>
      </footer>
    </main>
  );
}
