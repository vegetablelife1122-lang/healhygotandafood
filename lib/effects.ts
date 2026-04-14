// ① フラッシュ（画面が一瞬白く光る）
export function flashEffect() {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed; inset: 0; background: white;
    opacity: 0; z-index: 9999; pointer-events: none;
    transition: opacity 0.05s ease-in;
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = "0.85";
    setTimeout(() => {
      overlay.style.transition = "opacity 0.4s ease-out";
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 500);
    }, 80);
  });
}

// ② 紙吹雪・コンフェッティ
function confettiEffect() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: 9999; pointer-events: none;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 300,
    vx: (Math.random() - 0.5) * 5,
    vy: 3 + Math.random() * 5,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`,
    w: 7 + Math.random() * 8,
    h: 4 + Math.random() * 5,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.25,
  }));

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 220 && pieces.some((p) => p.y < canvas.height + 20)) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

// ③ キラキラ光が広がる
function sparkleEffect() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: 9999; pointer-events: none;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const sparks = Array.from({ length: 100 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 10;
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      size: 2 + Math.random() * 5,
      color: `hsl(${40 + Math.random() * 40}, 100%, ${55 + Math.random() * 30}%)`,
    };
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    sparks.forEach((s) => {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.12;
      s.vx *= 0.98;
      s.life -= s.decay;
      if (s.life > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    if (alive) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

// ④ 花火
function fireworksEffect() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: 9999; pointer-events: none;
  `;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  type Particle = {
    x: number; y: number; vx: number; vy: number;
    life: number; decay: number; size: number; color: string;
  };
  const bursts: Particle[][] = [];

  function createBurst(x: number, y: number) {
    const hue = Math.random() * 360;
    bursts.push(
      Array.from({ length: 70 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 7;
        return {
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          size: 2 + Math.random() * 4,
          color: `hsl(${hue + Math.random() * 40}, 100%, 65%)`,
        };
      })
    );
  }

  [0, 250, 500, 750, 1000].forEach((delay) => {
    setTimeout(() => {
      createBurst(
        80 + Math.random() * (canvas.width - 160),
        40 + Math.random() * (canvas.height * 0.55)
      );
    }, delay);
  });

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    bursts.forEach((particles) => {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.vx *= 0.98;
        p.life -= p.decay;
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    });
    frame++;
    if (frame < 350 && (alive || frame < 120)) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

const EFFECTS = [confettiEffect, fireworksEffect];

export function playRandomEffect() {
  const fn = EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
  fn();
}
