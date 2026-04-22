"use client";

import type { Filters, Area, VisitType, Genre, Drink } from "@/lib/types";
import { AREAS, VISIT_TYPES, GENRES, DRINKS, CALORIE_PRESETS } from "@/lib/constants";

interface FilterFormProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onSubmit: () => void;
}

export default function FilterForm({ filters, onChange, onSubmit }: FilterFormProps) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
      {/* Name search */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          店名で探す
        </label>
        <input
          type="text"
          value={filters.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="例：テーブル、焼鳥..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      {/* Area and Visit Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            エリア
          </label>
          <select
            value={filters.area}
            onChange={(e) => update("area", e.target.value as Area | "")}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="">未指定</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            シーン
          </label>
          <select
            value={filters.visitType}
            onChange={(e) => update("visitType", e.target.value as VisitType | "")}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="">未指定</option>
            {VISIT_TYPES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Genre and Drink */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ジャンル
          </label>
          <select
            value={filters.genre}
            onChange={(e) => update("genre", e.target.value as Genre | "")}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="">未指定</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            飲みたいもの
          </label>
          <select
            value={filters.drink}
            onChange={(e) => update("drink", e.target.value as Drink | "")}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="">未指定</option>
            {DRINKS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calories */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          カロリー上限
          {filters.maxCalories !== null && (
            <span className="ml-2 text-slate-700 font-bold">{filters.maxCalories} kcal 以下</span>
          )}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={() => update("maxCalories", null)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              filters.maxCalories === null
                ? "bg-emerald-800 text-white border-emerald-800"
                : "bg-white text-gray-600 border-gray-300 hover:border-emerald-700"
            }`}
          >
            未指定
          </button>
          {CALORIE_PRESETS.map((cal) => (
            <button
              type="button"
              key={cal}
              onClick={() => update("maxCalories", cal)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                filters.maxCalories === cal
                  ? "bg-emerald-800 text-white border-emerald-800"
                  : "bg-white text-gray-600 border-gray-300 hover:border-emerald-700"
              }`}
            >
              {cal}
            </button>
          ))}
        </div>
        {filters.maxCalories !== null && (
          <input
            type="range"
            min={300}
            max={1800}
            step={50}
            value={filters.maxCalories}
            onChange={(e) => update("maxCalories", Number(e.target.value))}
            className="w-full accent-emerald-700"
          />
        )}
      </div>

      {/* Open now */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.openNow}
              onChange={(e) => update("openNow", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-700 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-800">
            🕐 今開いてる店だけ表示
          </span>
        </label>
      </div>

      {/* Health preferences */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">健康志向の条件</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.preferHealthy}
              onChange={(e) => update("preferHealthy", e.target.checked)}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-slate-700">ヘルシー全般</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.preferHighProtein}
              onChange={(e) => update("preferHighProtein", e.target.checked)}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-slate-700">高たんぱく</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.preferVegetable}
              onChange={(e) => update("preferVegetable", e.target.checked)}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-slate-700">野菜多め</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.preferLowFried}
              onChange={(e) => update("preferLowFried", e.target.checked)}
              className="w-4 h-4 accent-emerald-700 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-slate-700">揚げ物少なめ</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-6 rounded-xl text-base transition-colors shadow-sm hover:shadow tracking-wide"
      >
        候補を見る
      </button>
    </form>
  );
}
