"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "gotanda_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 初回マウント時にlocalStorageから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const isFavorite = (id: string) => favorites.has(id);

  return { favorites, toggle, isFavorite };
}
