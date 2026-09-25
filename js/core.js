/* Bunny Birthday Adventure — core.js
   Shared namespace, tiny helpers and an event bus.
   Plain <script> files (no ES modules) so the game runs from file:// offline. */
window.BB = window.BB || {};

(function (BB) {
  'use strict';

  BB.$ = (sel, root = document) => root.querySelector(sel);
  BB.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  BB.wait = (ms) => new Promise((res) => setTimeout(res, ms));
  BB.rand = (a, b) => a + Math.random() * (b - a);
  BB.randInt = (a, b) => Math.floor(BB.rand(a, b + 1));
  BB.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  BB.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  BB.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** True unless the player (or their OS) asked for reduced motion. */
  BB.motionOK = () => !document.documentElement.classList.contains('reduce-motion');

  /** Centre point of an element in viewport coordinates. */
  BB.centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /** Restart a CSS animation class on an element. */
  BB.replay = (el, cls, ms) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // force reflow so the animation restarts
    el.classList.add(cls);
    if (ms) setTimeout(() => el.classList.remove(cls), ms);
  };

  /** Inline style helper for things placed on the scene stage.
      Sizes use --u (a stage unit ≈ 1% of stage height, shrunk on narrow stages). */
  BB.st = (o) => {
    const s = [];
    if (o.l != null) s.push(`left:${o.l}%`);
    if (o.r != null) s.push(`right:${o.r}%`);
    if (o.b != null) s.push(`bottom:${o.b}%`);
    if (o.bu != null) s.push(`bottom:calc(var(--u)*${o.bu})`);
    if (o.t != null) s.push(`top:${o.t}%`);
    if (o.w != null) s.push(`width:calc(var(--u)*${o.w})`);
    if (o.h != null) s.push(`height:calc(var(--u)*${o.h})`);
    if (o.cx) s.push(`margin-left:calc(var(--u)*${-o.w / 2})`);
    if (o.z != null) s.push(`z-index:${o.z}`);
    if (o.extra) s.push(o.extra);
    return s.join(';');
  };

  const listeners = {};
  BB.on = (ev, fn) => {
    (listeners[ev] = listeners[ev] || []).push(fn);
  };
  BB.emit = (ev, ...args) => {
    (listeners[ev] || []).forEach((fn) => {
      try {
        fn(...args);
      } catch (err) {
        console.error(err);
      }
    });
  };
})(window.BB);
