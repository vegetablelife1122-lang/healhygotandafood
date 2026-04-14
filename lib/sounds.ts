import { playRandomEffect, flashEffect } from "@/lib/effects";

type AudioContextType = typeof AudioContext;

function getAudioContext(): AudioContext | null {
  try {
    const Ctx = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext);
    return new Ctx();
  } catch {
    return null;
  }
}

// ブラス風の音1音を鳴らすヘルパー（sawtooth + ビブラート）
function brass(
  ctx: AudioContext,
  freq: number,
  start: number,
  dur: number,
  vol = 0.35,
  vibrato = false
) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  lfo.frequency.setValueAtTime(6, now + start);
  lfoGain.gain.setValueAtTime(vibrato ? freq * 0.018 : 0, now + start);
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, now + start);
  gain.gain.setValueAtTime(0, now + start);
  gain.gain.linearRampToValueAtTime(vol, now + start + 0.015);
  gain.gain.setValueAtTime(vol * 0.85, now + start + dur * 0.6);
  gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
  lfo.start(now + start);
  lfo.stop(now + start + dur + 0.05);
  osc.start(now + start);
  osc.stop(now + start + dur + 0.05);
}

// テッテレー共通の音色エンジン（倍音合成＋リバーブ＋コンプ）
function playTetteree(
  ctx: AudioContext,
  notes: { freq: number; start: number; dur: number; vol?: number }[]
) {
  const now = ctx.currentTime;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.setValueAtTime(-6, now);
  comp.ratio.setValueAtTime(4, now);
  comp.attack.setValueAtTime(0.002, now);
  comp.release.setValueAtTime(0.1, now);
  comp.connect(ctx.destination);

  // 簡易リバーブ
  [{ t: 0.055, g: 0.18 }, { t: 0.085, g: 0.10 }].forEach(({ t, g }) => {
    const rev = ctx.createDelay(0.5);
    const rg = ctx.createGain();
    rev.delayTime.setValueAtTime(t, now);
    rg.gain.setValueAtTime(g, now);
    comp.connect(rev); rev.connect(rg); rg.connect(ctx.destination);
  });

  const harmonics = [
    { n: 1, a: 1.00 }, { n: 2, a: 0.55 },
    { n: 3, a: 0.30 }, { n: 4, a: 0.12 }, { n: 5, a: 0.06 },
  ];
  const totalAmp = harmonics.reduce((s, h) => s + h.a, 0);

  notes.forEach(({ freq, start, dur, vol = 0.38 }) => {
    const isLong = dur > 0.2;
    harmonics.forEach(({ n, a }) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * n * 0.985, now + start);
      osc.frequency.linearRampToValueAtTime(freq * n, now + start + 0.022);

      if (isLong && n === 1) {
        const lfo = ctx.createOscillator();
        const lg = ctx.createGain();
        lfo.frequency.setValueAtTime(5.5, now + start);
        lg.gain.setValueAtTime(0, now + start);
        lg.gain.linearRampToValueAtTime(freq * 0.011, now + start + 0.22);
        lfo.connect(lg); lg.connect(osc.frequency);
        lfo.start(now + start); lfo.stop(now + start + dur + 0.1);
      }

      const g = ctx.createGain();
      osc.connect(g); g.connect(comp);
      const v = (vol * a) / totalAmp;
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(v, now + start + 0.02);
      g.gain.linearRampToValueAtTime(v * 0.80, now + start + Math.min(0.09, dur * 0.45));
      g.gain.setValueAtTime(v * 0.80, now + start + dur - 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.1);
    });
  });
}

// ① テッ テッ テレレレレー（Cメジャー・標準）
function playDokkiri1(ctx: AudioContext) {
  playTetteree(ctx, [
    { freq: 523.25, start: 0.00, dur: 0.09 },           // テッ C5
    { freq: 523.25, start: 0.12, dur: 0.09 },           // テッ C5
    { freq: 659.25, start: 0.24, dur: 0.06 },           // テ  E5
    { freq: 783.99, start: 0.31, dur: 0.06 },           // レ  G5
    { freq: 880.00, start: 0.38, dur: 0.06 },           // レ  A5
    { freq: 987.77, start: 0.45, dur: 0.06 },           // レ  B5
    { freq: 1046.5, start: 0.52, dur: 0.75, vol: 0.42 },// ーン C6
  ]);
}

// ② テッ テッ テレレレー（Gメジャー・少し低め落ち着いた）
function playDokkiri2(ctx: AudioContext) {
  playTetteree(ctx, [
    { freq: 392.00, start: 0.00, dur: 0.09 },           // テッ G4
    { freq: 392.00, start: 0.12, dur: 0.09 },           // テッ G4
    { freq: 493.88, start: 0.24, dur: 0.06 },           // テ  B4
    { freq: 587.33, start: 0.31, dur: 0.06 },           // レ  D5
    { freq: 659.25, start: 0.38, dur: 0.06 },           // レ  E5
    { freq: 739.99, start: 0.45, dur: 0.06 },           // レ  F#5
    { freq: 783.99, start: 0.52, dur: 0.75, vol: 0.42 },// ーン G5
  ]);
}

// ③ テッ テッ テッ テレレー（3連打→短いラン・テンポ速め）
function playDokkiri3(ctx: AudioContext) {
  playTetteree(ctx, [
    { freq: 523.25, start: 0.00, dur: 0.07 },           // テッ C5
    { freq: 523.25, start: 0.09, dur: 0.07 },           // テッ C5
    { freq: 523.25, start: 0.18, dur: 0.07 },           // テッ C5
    { freq: 659.25, start: 0.27, dur: 0.06 },           // テ  E5
    { freq: 783.99, start: 0.34, dur: 0.06 },           // レ  G5
    { freq: 1046.5, start: 0.41, dur: 0.70, vol: 0.42 },// ーン C6
  ]);
}

// ④ テッ テレレレレー（1打→ロングラン・一番テレビっぽい）
function playDokkiri4(ctx: AudioContext) {
  playTetteree(ctx, [
    { freq: 523.25, start: 0.00, dur: 0.11 },           // テッ C5
    { freq: 659.25, start: 0.15, dur: 0.06 },           // テ  E5
    { freq: 739.99, start: 0.22, dur: 0.06 },           // レ  F#5
    { freq: 830.61, start: 0.29, dur: 0.06 },           // レ  Ab5
    { freq: 880.00, start: 0.36, dur: 0.06 },           // レ  A5
    { freq: 987.77, start: 0.43, dur: 0.06 },           // レ  B5
    { freq: 1046.5, start: 0.50, dur: 0.80, vol: 0.42 },// ーン C6
  ]);
}

// ② ジャジャジャジャーン！（クイズ番組正解音）
// ド・ミ・ソ・ドーン！の和音ヒット
function playJajajan(ctx: AudioContext) {
  const now = ctx.currentTime;
  const chords = [
    { t: 0.00, freqs: [261.63, 329.63, 392.00] },           // ド・ミ・ソ（短く）
    { t: 0.13, freqs: [293.66, 369.99, 440.00] },           // レ・ファ#・ラ（短く）
    { t: 0.26, freqs: [329.63, 415.30, 493.88] },           // ミ・ソ#・シ（短く）
    { t: 0.40, freqs: [392.00, 493.88, 587.33, 783.99] },   // ソ・シ・レ・ソ（長い！）
  ];
  chords.forEach(({ t, freqs }, ci) => {
    const dur = ci < 3 ? 0.10 : 0.7;
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + t);
      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.18, now + t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
      osc.start(now + t);
      osc.stop(now + t + dur + 0.05);
    });
  });
}

// ③ レベルアップ！（ゲーム昇格音）
// ド ミ ソ ド（1オクターブ上）をキラキラ駆け上がる
function playLevelUp(ctx: AudioContext) {
  const now = ctx.currentTime;
  const steps = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.5];
  steps.forEach((freq, i) => {
    const start = i * 0.075;
    const dur = i === steps.length - 1 ? 0.6 : 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = i === steps.length - 1 ? "sine" : "square";
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0.22, now + start);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  });
}

// ④ 大当たり！（スロット・ジャックポット）
// コインがザザーっと降り注ぐ
function playJackpot(ctx: AudioContext) {
  const now = ctx.currentTime;
  // 最初にドーン！
  brass(ctx, 523.25, 0.00, 0.15, 0.4);
  brass(ctx, 659.25, 0.10, 0.15, 0.4);
  brass(ctx, 783.99, 0.20, 0.55, 0.45, true);
  // コインざらざら（高音ランダムピン）
  for (let i = 0; i < 18; i++) {
    const t = 0.28 + Math.random() * 0.55;
    const freq = 1200 + Math.random() * 1600;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + t);
    gain.gain.setValueAtTime(0.12, now + t);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.12);
    osc.start(now + t);
    osc.stop(now + t + 0.15);
  }
}

// ⑤ パパパパーン！（オリンピック表彰台風ファンファーレ）
// 短音×3 → 長音で締める、荘厳な感じ
function playOlympic(ctx: AudioContext) {
  brass(ctx, 392.00, 0.00, 0.10);       // パ   G4
  brass(ctx, 523.25, 0.12, 0.10);       // パ   C5
  brass(ctx, 659.25, 0.24, 0.10);       // パ   E5
  brass(ctx, 523.25, 0.36, 0.08);       // パ   C5
  brass(ctx, 392.00, 0.44, 0.08);       // パ   G4
  brass(ctx, 523.25, 0.52, 0.08);       // パ   C5
  brass(ctx, 783.99, 0.62, 0.75, 0.42, true); // ーン！ G5
}

// 実音源：ドラムロール→シンバル
function playDrumroll(ctx: AudioContext, onCymbal?: () => void) {
  fetch("/drumroll.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const now = ctx.currentTime; // fetch後に取得
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(3.0, now);
      src.connect(g);
      g.connect(ctx.destination);
      const rollDur = Math.min(decoded.duration, 2.5);
      src.start(now);
      src.stop(now + rollDur);
      playCymbal(ctx, now + rollDur, onCymbal);
    })
    .catch(() => playDrumrollSynth(ctx));
}

// シンバルクラッシュ単体（実音源ドラムロール後に呼ぶ）
function playCymbal(ctx: AudioContext, startTime: number, onCymbal?: () => void) {
  fetch("/crash-cymbal.wav")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(3.0, startTime);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(startTime);

      // シンバルが鳴る瞬間にエフェクト＆コールバック発火
      const delay = Math.max(0, (startTime - ctx.currentTime) * 1000);
      setTimeout(() => {
        playRandomEffect();
        onCymbal?.();
      }, delay);
    })
    .catch(() => {});
}

// フォールバック（合成ドラムロール）
function playDrumrollSynth(ctx: AudioContext) {
  const now = ctx.currentTime;
  const rollDur = 2.0;
  const rollCount = 50;

  // ティンパニ1打を鳴らす（サイン波＋ピッチ急降下＋ノイズ混ぜ）
  function timpaniHit(t: number, vol: number) {
    // ピッチ成分（ボワン感）
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, now + t);
    osc.frequency.exponentialRampToValueAtTime(60, now + t + 0.12);
    osc.connect(og); og.connect(ctx.destination);
    og.gain.setValueAtTime(vol, now + t);
    og.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
    osc.start(now + t); osc.stop(now + t + 0.2);

    // アタックのバシッ感（短いノイズ）
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.005));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const ng = ctx.createGain();
    src.connect(ng); ng.connect(ctx.destination);
    ng.gain.setValueAtTime(vol * 0.6, now + t);
    src.start(now + t);
  }

  // だんだん速く・だんだん大きくなるロール
  for (let i = 0; i < rollCount; i++) {
    const t = (i / rollCount) * rollDur;
    const vol = 0.15 + (i / rollCount) * 0.45;
    timpaniHit(t, vol);
  }

  // シンバルクラッシュ（実音源・ウザいくらいデカく）
  const ct = now + rollDur + 0.02;
  fetch("/crash-cymbal.wav")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(3.0, ct); // ウザいくらいデカい
      src.connect(g);
      g.connect(ctx.destination);
      src.start(ct);
    })
    .catch(() => {
      // フォールバック（ファイルが読めない場合）
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(400, ct);
      g.gain.setValueAtTime(0.5, ct);
      g.gain.exponentialRampToValueAtTime(0.001, ct + 2.0);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(ct); osc.stop(ct + 2.1);
    });

}

// ⑦ チキチキチキ...ドン！（ルーレット→決定音）
function playRoulette(ctx: AudioContext) {
  const now = ctx.currentTime;
  const tickCount = 12;
  for (let i = 0; i < tickCount; i++) {
    const t = now + i * i * 0.008;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (ctx.sampleRate * 0.003));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    src.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, t);
    src.start(t);
  }
  const hitTime = now + (tickCount - 1) * (tickCount - 1) * 0.008 + 0.06;
  brass(ctx, 659.25, hitTime - now, 0.6, 0.45, true);
}

// ⑧ ポポポポーン！（泡ぽこぽこ上昇）
function playPopoon(ctx: AudioContext) {
  const now = ctx.currentTime;
  [300, 400, 530, 700, 900].forEach((freq, i) => {
    const start = i * 0.10;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.4, now + start);
    osc.frequency.exponentialRampToValueAtTime(freq, now + start + 0.06);
    gain.gain.setValueAtTime(0.3, now + start);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.28);
    osc.start(now + start);
    osc.stop(now + start + 0.33);
  });
}

// ⑨ エアホーン！（BRAAAAP）
// フェスやスポーツで鳴り響くバカでかいホーン
function playAirhorn(ctx: AudioContext) {
  const now = ctx.currentTime;
  // メインの爆音ホーン（低音sawtooth）
  [110, 146.83, 174.61].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(i === 0 ? 0.45 : 0.25, now + 0.02);
    gain.gain.setValueAtTime(i === 0 ? 0.45 : 0.25, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc.start(now);
    osc.stop(now + 1.2);
  });
  // 高音でシュー感を足す
  const noiseOsc = ctx.createOscillator();
  const noiseGain = ctx.createGain();
  noiseOsc.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseOsc.type = "sawtooth";
  noiseOsc.frequency.setValueAtTime(55, now);
  noiseOsc.frequency.linearRampToValueAtTime(45, now + 1.0);
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
  noiseOsc.start(now);
  noiseOsc.stop(now + 1.2);
}

// ⑩ ドカーン！爆発→ファンファーレ
// ドカンと爆発してから颯爽とブラスが入る
function playExplosion(ctx: AudioContext) {
  const now = ctx.currentTime;
  // 爆発（ホワイトノイズ＋低音うねり）
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(400, now);
  const eg = ctx.createGain();
  src.connect(lp); lp.connect(eg); eg.connect(ctx.destination);
  eg.gain.setValueAtTime(0.9, now);
  src.start(now);
  // 爆発後のブラスファンファーレ
  brass(ctx, 392.00, 0.35, 0.10, 0.4);
  brass(ctx, 523.25, 0.47, 0.10, 0.4);
  brass(ctx, 659.25, 0.59, 0.65, 0.45, true);
}

// ⑪ シャキーン！（アニメ必殺技・刀を抜く音）
// キーンと金属音が響いて光る感じ
function playShakiin(ctx: AudioContext) {
  const now = ctx.currentTime;
  // 金属的なシュワー（高音サイン波が上昇して消える）
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.connect(g1); g1.connect(ctx.destination);
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(200, now);
  osc1.frequency.exponentialRampToValueAtTime(4000, now + 0.12);
  osc1.frequency.exponentialRampToValueAtTime(6000, now + 0.25);
  g1.gain.setValueAtTime(0.5, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
  osc1.start(now); osc1.stop(now + 0.6);

  // 残響キーン
  [0.15, 0.25, 0.35].forEach((t) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(5000 + Math.random() * 2000, now + t);
    g.gain.setValueAtTime(0.15, now + t);
    g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
    osc.start(now + t); osc.stop(now + t + 0.45);
  });

  // 決め！のブラス
  brass(ctx, 783.99, 0.30, 0.55, 0.38, true);
}

// ⑫ 宇宙人来た！（UFO降臨音）
// ヒューンとうねる謎のエイリアン音→ドン！
function playUFO(ctx: AudioContext) {
  const now = ctx.currentTime;
  // UFOうねうね
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  const g = ctx.createGain();
  lfo.frequency.setValueAtTime(2, now);
  lfo.frequency.linearRampToValueAtTime(12, now + 0.8);
  lg.gain.setValueAtTime(80, now);
  lg.gain.linearRampToValueAtTime(300, now + 0.8);
  lfo.connect(lg); lg.connect(osc.frequency);
  osc.connect(g); g.connect(ctx.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
  osc.frequency.exponentialRampToValueAtTime(250, now + 0.8);
  g.gain.setValueAtTime(0.3, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
  lfo.start(now); lfo.stop(now + 0.9);
  osc.start(now); osc.stop(now + 0.9);

  // 着陸ドン！＋ファンファーレ
  const dbuf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const dd = dbuf.getChannelData(0);
  for (let i = 0; i < dd.length; i++) {
    dd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
  }
  const dsrc = ctx.createBufferSource();
  dsrc.buffer = dbuf;
  const dg = ctx.createGain();
  dsrc.connect(dg); dg.connect(ctx.destination);
  dg.gain.setValueAtTime(0.6, now + 0.85);
  dsrc.start(now + 0.85);
  brass(ctx, 659.25, 0.92, 0.55, 0.42, true);
}

// ⑬ 変身！（仮面ライダー・スーパー戦隊風）
// 電子音が唸ってパワーアップ→ジャーン！
function playHenshin(ctx: AudioContext) {
  const now = ctx.currentTime;
  // 変身音（うねる電子音）
  [0, 0.12, 0.24].forEach((t, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "square";
    const base = 200 + i * 120;
    osc.frequency.setValueAtTime(base, now + t);
    osc.frequency.exponentialRampToValueAtTime(base * 2.5, now + t + 0.10);
    g.gain.setValueAtTime(0.22, now + t);
    g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.11);
    osc.start(now + t); osc.stop(now + t + 0.15);
  });
  // ジャーン！（和音）
  [392, 523.25, 659.25, 783.99].forEach((freq) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, now + 0.42);
    g.gain.setValueAtTime(0, now + 0.42);
    g.gain.linearRampToValueAtTime(0.18, now + 0.435);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc.start(now + 0.42); osc.stop(now + 1.15);
  });
}

// 実音源：トランペットファンファーレ
function playFanfareSample(ctx: AudioContext) {
  fetch("/fanfare.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(4.0, ctx.currentTime);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(ctx.currentTime);
    })
    .catch(() => playDokkiri1(ctx));
}

// 実音源：テーレッテレー（どっきり系）
function playTettereSample(ctx: AudioContext) {
  fetch("/tettere.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(4.0, ctx.currentTime);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(ctx.currentTime);
    })
    .catch(() => playDokkiri1(ctx));
}

// 実音源：歓声①（crowd-cheer・高音質）
function playCheer1(ctx: AudioContext) {
  fetch("/cheer1.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(2.5, ctx.currentTime);
      src.connect(g); g.connect(ctx.destination);
      src.start(ctx.currentTime);
    })
    .catch(() => {});
}

// 実音源：歓声②（crowd-cheering・短め）
function playCheer2(ctx: AudioContext) {
  fetch("/cheer2.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(2.5, ctx.currentTime);
      src.connect(g); g.connect(ctx.destination);
      src.start(ctx.currentTime);
    })
    .catch(() => {});
}

// ハズレ音①（sad trombone・ズコーッ）
function playHazure1(ctx: AudioContext) {
  fetch("/hazure1.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(2.5, ctx.currentTime);
      src.connect(g); g.connect(ctx.destination);
      src.start(ctx.currentTime);
    })
    .catch(() => {});
}

// ハズレ音②（failure・短め）
function playHazure2(ctx: AudioContext) {
  fetch("/hazure2.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(2.5, ctx.currentTime);
      src.connect(g); g.connect(ctx.destination);
      src.start(ctx.currentTime);
    })
    .catch(() => {});
}

export function playHazure() {
  const ctx = getAudioContext();
  if (!ctx) return;
  playHazure1(ctx);
}

// 実音源：ゼルダ アイテムゲット（レア・1/20）
function playZelda(ctx: AudioContext) {
  fetch("/zelda-item-get.mp3")
    .then((res) => res.arrayBuffer())
    .then((buf) => ctx.decodeAudioData(buf))
    .then((decoded) => {
      const src = ctx.createBufferSource();
      src.buffer = decoded;
      const g = ctx.createGain();
      g.gain.setValueAtTime(3.0, ctx.currentTime);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(ctx.currentTime);
    })
    .catch(() => {});
}

// 1/20の確率でゼルダ、それ以外は通常サウンド
const NORMAL_SOUNDS = [
  playTettereSample, // 実音源：テーレッテレー（どっきり系）
  playTettereSample, // 出現率UP
  playFanfareSample, // 実音源：トランペットファンファーレ
  playDrumroll,      // ドラムロール→シンバル
  playDrumroll,      // 出現率UP
  playCheer1,        // 歓声①単独
  playCheer2,        // 歓声②単独
];

const CHEERS = [playCheer1, playCheer2];

function playRandomCheer(ctx: AudioContext) {
  const fn = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  fn(ctx);
}

export function playRandomFanfare(onReveal?: () => void) {
  const ctx = getAudioContext();
  if (!ctx) return;
  // 1/15でゼルダ（即時）
  if (Math.random() < 1 / 15) {
    playZelda(ctx);
    flashEffect();
    onReveal?.();
    return;
  }
  const fn = NORMAL_SOUNDS[Math.floor(Math.random() * NORMAL_SOUNDS.length)];
  if (fn === playDrumroll) {
    // ドラムロール：シンバルの瞬間にエフェクト＋店舗表示
    playDrumroll(ctx, onReveal);
  } else {
    fn(ctx);
    // ファンファーレのときだけ歓声を重ねる
    if (fn === playFanfareSample) playRandomCheer(ctx);
    playRandomEffect();
    onReveal?.();
  }
}

