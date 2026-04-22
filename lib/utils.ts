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

// 曜日文字 → JS getDay() と同じ数値 (0=日, 1=月, ..., 6=土)
const DAY_MAP: Record<string, number> = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };

function parseDays(text: string): number[] {
  const days = new Set<number>();
  if (/毎日/.test(text) || /月[〜～]日/.test(text)) return [0, 1, 2, 3, 4, 5, 6];
  // 範囲（月〜金 など）を展開
  const stripped = text.replace(/([月火水木金土日])[〜～]([月火水木金土日])/g, (_, s, e) => {
    const si = DAY_MAP[s], ei = DAY_MAP[e];
    if (si <= ei) {
      for (let d = si; d <= ei; d++) days.add(d);
    } else {
      for (let d = si; d <= 6; d++) days.add(d);
      for (let d = 0; d <= ei; d++) days.add(d);
    }
    return "";
  });
  // 残った個別の曜日文字
  for (const ch of Object.keys(DAY_MAP)) {
    if (stripped.includes(ch)) days.add(DAY_MAP[ch]);
  }
  return [...days];
}

function parseTimeRanges(text: string): [number, number][] {
  const ranges: [number, number][] = [];
  const re = /(\d{1,2}):(\d{2})[〜～](翌)?(\d{1,2}):(\d{2})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = parseInt(m[1]) * 60 + parseInt(m[2]);
    const endH = parseInt(m[4]) + (m[3] ? 24 : 0);
    const end = endH * 60 + parseInt(m[5]);
    ranges.push([start, end]);
  }
  return ranges;
}

export function isOpenNow(openingHours: string, now: Date = new Date()): boolean {
  if (!openingHours) return true;
  const currentDay = now.getDay();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const segments = openingHours.split(/\s*\/\s*/);
  let lastDays: number[] = [];

  for (const seg of segments) {
    if (!seg.trim()) continue;
    // 定休・休み セグメントはスキップ
    if (/定休|休み/.test(seg)) continue;

    const days = parseDays(seg);
    if (days.length > 0) lastDays = days;
    const applicableDays = lastDays;

    const timeRanges = parseTimeRanges(seg);
    for (const [start, end] of timeRanges) {
      if (end > 24 * 60) {
        // 深夜をまたぐ枠: 翌XX時 → 「前日扱い」で開いた枠が今日未明まで続く
        const prevDay = (currentDay + 6) % 7;
        if (applicableDays.includes(prevDay) && currentMins <= end - 24 * 60) return true;
        if (applicableDays.includes(currentDay) && currentMins >= start) return true;
      } else {
        if (applicableDays.includes(currentDay) && currentMins >= start && currentMins <= end) return true;
      }
    }
  }
  return false;
}
