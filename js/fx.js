/* Bunny Birthday Adventure — fx.js
   Juice: floating text, sparkles, flying icons, confetti, toasts and speech barks. */
(function (BB) {
  'use strict';

  const FX = (BB.fx = {});
  const layer = () => document.getElementById('fx-layer');

  /** Rising text such as "+1 🥕" or "-3 🥕". */
  FX.float = function (x, y, html, cls = '') {
    const el = document.createElement('div');
    el.className = 'float-text ' + cls;
    el.innerHTML = html;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    layer().appendChild(el);
    setTimeout(() => el.remove(), 1500);
  };
  FX.floatAt = (target, html, cls) => {
    if (!target) return;
    const c = BB.centerOf(target);
    FX.float(c.x, c.y - 16, html, cls);
  };

  /** Burst of little sparkles/stars/hearts around a point. */
  FX.sparkle = function (x, y, n = 10, o = {}) {
    const shapes = o.shapes || ['✦', '✧', '★', '•'];
    const colors = o.colors || ['#ffd54f', '#ff9a3c', '#ff8fab', '#fff3a0', '#ffb347'];
    const count = BB.motionOK() ? n : Math.ceil(n / 3);
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'spark';
      el.textContent = BB.pick(shapes);
      const a = (Math.PI * 2 * i) / count + BB.rand(-0.3, 0.3);
      const d = BB.rand(30, o.spread || 80);
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.color = BB.pick(colors);
      el.style.fontSize = BB.rand(10, 20) + 'px';
      el.style.setProperty('--dx', Math.cos(a) * d + 'px');
      el.style.setProperty('--dy', Math.sin(a) * d + 'px');
      el.style.animationDelay = BB.rand(0, 0.08) + 's';
      layer().appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  };
  FX.sparkleAt = (target, n, o) => {
    if (!target) return;
    const c = BB.centerOf(target);
    FX.sparkle(c.x, c.y, n, o);
  };

  /** A soft cloud puff (flour!) */
  FX.puff = function (x, y, n = 8, color = '#fff') {
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      el.className = 'puff';
      el.style.left = x + BB.rand(-30, 30) + 'px';
      el.style.top = y + BB.rand(-20, 10) + 'px';
      el.style.background = color;
      const s = BB.rand(30, 70);
      el.style.width = el.style.height = s + 'px';
      el.style.setProperty('--dx', BB.rand(-60, 60) + 'px');
      el.style.setProperty('--dy', BB.rand(-80, -20) + 'px');
      el.style.animationDelay = BB.rand(0, 0.15) + 's';
      layer().appendChild(el);
      setTimeout(() => el.remove(), 1400);
    }
  };

  /** Fly a small icon from one element to another (e.g. shop item → inventory button). */
  FX.fly = function (from, to, html, onDone) {
    if (!from || !to) {
      if (onDone) onDone();
      return;
    }
    const a = from.getBoundingClientRect ? BB.centerOf(from) : from;
    const b = BB.centerOf(to);
    const el = document.createElement('div');
    el.className = 'fly-icon';
    el.innerHTML = html;
    el.style.left = a.x + 'px';
    el.style.top = a.y + 'px';
    layer().appendChild(el);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const done = () => {
      el.remove();
      BB.replay(to, 'bump', 500);
      if (onDone) onDone();
    };
    if (!BB.motionOK() || !el.animate) {
      setTimeout(done, 120);
      return;
    }
    const anim = el.animate(
      [
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 90}px)) scale(1.25)`, opacity: 1, offset: 0.45 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.4)`, opacity: 0.6 },
      ],
      { duration: 750, easing: 'cubic-bezier(.45,.05,.4,1)' }
    );
    anim.onfinish = done;
  };

  /* ---------- toasts ---------- */
  FX.toast = function (html, o = {}) {
    const root = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + (o.type || '');
    // plain-text toasts get one wrapper so inline <b> tags don't become separate flex items
    el.innerHTML = html.trim().startsWith('<') ? html : `<span>${html}</span>`;
    root.appendChild(el);
    while (root.children.length > 3) root.firstChild.remove();
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 400);
    }, o.dur || 2600);
    return el;
  };

  /* ---------- speech barks (little bubbles above characters) ---------- */
  const barks = new Map();
  FX.bark = function (target, text, dur = 2600) {
    if (!target) return;
    const key = (target.dataset && (target.dataset.actor || target.dataset.id)) || target;
    const old = barks.get(key);
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'bark';
    el.textContent = text;
    layer().appendChild(el);
    const place = () => {
      const r = target.getBoundingClientRect();
      const w = el.offsetWidth;
      let x = r.left + r.width / 2 - w / 2;
      x = BB.clamp(x, 8, window.innerWidth - w - 8);
      el.style.left = x + 'px';
      el.style.top = Math.max(8, r.top - el.offsetHeight - 6) + 'px';
      el.style.setProperty('--tail', BB.clamp(r.left + r.width / 2 - x, 16, w - 16) + 'px');
    };
    place();
    barks.set(key, el);
    target.classList.add('talking');
    setTimeout(() => {
      if (barks.get(key) === el) target.classList.remove('talking');
    }, Math.min(dur, 1400));
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => {
        el.remove();
        if (barks.get(key) === el) barks.delete(key);
      }, 300);
    }, dur);
  };

  FX.shake = (el) => BB.replay(el, 'shake', 500);

  /* ---------- confetti (canvas) ---------- */
  let canvas;
  let ctx;
  let parts = [];
  let raf = null;
  const COLORS = ['#ff9a3c', '#ffd54f', '#ff8fab', '#8bd35f', '#4fc3f7', '#b388ff', '#ffffff', '#ff6f91'];

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const H = window.innerHeight;
    parts = parts.filter((p) => p.y < H + 40 && p.life > 0);
    parts.forEach((p) => {
      p.vy += p.g;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.x += p.vx + Math.sin(p.t * p.wob) * 0.6;
      p.y += p.vy;
      p.t += 0.05;
      p.rot += p.vr;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.c;
      if (p.shape === 0) ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.t * 2)));
      else if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -p.w / 2);
        ctx.lineTo(p.w / 2, p.w / 2);
        ctx.lineTo(-p.w / 2, p.w / 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(tick);
    else {
      raf = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  /**
   * Confetti burst.
   * o.x/o.y: origin in px (defaults to a rain from the top), o.count, o.spread, o.power
   */
  FX.confetti = function (o = {}) {
    if (!canvas) {
      canvas = document.getElementById('confetti');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }
    let count = o.count || 120;
    if (!BB.motionOK()) count = Math.min(24, Math.ceil(count / 5));
    const W = window.innerWidth;
    for (let i = 0; i < count; i++) {
      const rain = o.x == null;
      const a = rain ? Math.PI / 2 : -Math.PI / 2 + BB.rand(-1, 1) * (o.spread || 0.9);
      const v = rain ? BB.rand(1, 3) : BB.rand(5, 12) * (o.power || 1);
      parts.push({
        x: rain ? BB.rand(0, W) : o.x,
        y: rain ? BB.rand(-H0(), -10) : o.y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        g: BB.motionOK() ? 0.16 : 0.08,
        w: BB.rand(7, 12),
        h: BB.rand(10, 16),
        c: BB.pick(COLORS),
        rot: BB.rand(0, 6),
        vr: BB.rand(-0.2, 0.2),
        t: BB.rand(0, 6),
        wob: BB.rand(0.5, 2),
        shape: BB.randInt(0, 2),
        life: BB.rand(160, 260),
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const H0 = () => window.innerHeight * 0.6;

  FX.confettiAt = (target, count = 60) => {
    if (!target) return FX.confetti({ count });
    const c = BB.centerOf(target);
    FX.confetti({ x: c.x, y: c.y, count });
  };

  /** Balloons floating up the screen (finale). */
  FX.balloons = function (n = 14, container) {
    if (!BB.motionOK()) n = 4;
    const colors = ['#ff9a3c', '#ffd54f', '#ff8fab', '#ffb3c7', '#9ad8ff', '#8ed0a8'];
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'float-balloon';
      const c = BB.pick(colors);
      el.innerHTML = `<svg viewBox="0 0 60 120"><path d="M30 70 Q24 90 32 118" stroke="#8a5a44" stroke-width="1.5" fill="none"/><ellipse cx="30" cy="36" rx="24" ry="30" fill="${c}" stroke="#6b3f2a" stroke-width="2.5"/><path d="M26 67 l4 -5 l4 5z" fill="${c}" stroke="#6b3f2a" stroke-width="1.5"/><ellipse cx="21" cy="24" rx="5" ry="9" fill="#fff" opacity=".5"/></svg>`;
      el.style.left = BB.rand(2, 92) + 'vw';
      el.style.animationDuration = BB.rand(5, 9) + 's';
      el.style.animationDelay = BB.rand(0, 2.5) + 's';
      el.style.setProperty('--sway', BB.rand(-40, 40) + 'px');
      el.style.width = BB.rand(40, 70) + 'px';
      (container || layer()).appendChild(el);
      setTimeout(() => el.remove(), 12500);
    }
  };
})(window.BB);
