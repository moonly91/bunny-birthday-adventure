/* Bunny Birthday Adventure — scenes.js
   Scene manager (teleporting + transitions) plus the Kitchen and Carrot Market scenes.
   The Garden and Party Room live in garden.js and party.js. */
(function (BB) {
  'use strict';

  const SC = (BB.scenes = {});
  BB.SCENES = {};
  let busy = false;

  /* ---------- shared helpers ---------- */
  let actorN = 0;
  /** A clickable bunny standing in a scene. */
  BB.actorHTML = function (id, o) {
    const C = BB.CHARS[id];
    const w = (o.h * 200) / 262;
    const news = BB.hasNews(id) ? ' has-news' : '';
    actorN += 1;
    return (
      `<button class="actor actor-${id}${news} ${o.cls || ''}" data-act="talk" data-actor="${id}" style="${BB.st({ l: o.l, b: o.b, bu: o.bu, w, h: o.h, z: o.z ?? 20, extra: o.extra })}" aria-label="Talk to ${C.name}, ${C.role}">` +
      `<span class="actor-inner" style="--d:${((actorN * 0.37) % 1.6).toFixed(2)}s">${BB.art.bunny(id, o.art || {})}</span>` +
      `<span class="actor-name">${C.name}</span><span class="news" aria-hidden="true">!</span></button>`
    );
  };

  /** A clickable prop/hotspot. */
  BB.propHTML = function (o) {
    return (
      `<button class="prop ${o.cls || ''}" data-act="${o.act}"${o.id ? ` data-id="${o.id}"` : ''} style="${BB.st(o)}" aria-label="${BB.esc(o.label)}">` +
      `${o.html}${o.tag ? `<span class="prop-tag">${o.tag}</span>` : ''}</button>`
    );
  };
  BB.decoHTML = (o) => `<div class="deco ${o.cls || ''}" style="${BB.st(o)}" aria-hidden="true">${o.html}</div>`;

  SC.init = function () {
    const stage = document.getElementById('scene');
    stage.addEventListener('click', (e) => {
      const t = e.target.closest('[data-act]');
      if (!t || busy) return;
      if (BB.dialogue.isOpen()) {
        BB.replay(document.querySelector('#dialogue .dlg-box'), 'shake', 450);
        return;
      }
      const act = t.dataset.act;
      if (act === 'talk') {
        BB.audio.play('pop');
        BB.replay(t, 'boop', 400);
        BB.talk(t.dataset.actor);
        return;
      }
      const sc = BB.SCENES[BB.S.location];
      if (sc && sc.onAction) sc.onAction(act, t, e);
    });
  };

  /** What the current scene shows; when it changes the scene needs a full redraw. */
  function signature() {
    const s = BB.S;
    const g = BB.game;
    return [
      s.location, g.bunniesAt(s.location).join(','), g.readyForSurprise(), s.surprise.hiding, s.finished,
      s.cake.done, s.muffins.done, s.flags.bunFound, s.garden.respawned, JSON.stringify(s.decor),
    ].join('|');
  }
  let lastSig = '';

  /** Remember which control had keyboard focus so it can be restored after a redraw. */
  function focusKey() {
    const a = document.activeElement;
    if (!a || !a.closest || !a.closest('#stage')) return null;
    for (const k of ['item', 'actor', 'slot', 'id', 'ui', 'act']) if (a.dataset && a.dataset[k]) return `[data-${k}="${a.dataset[k]}"]`;
    return null;
  }
  function restoreFocus(key) {
    if (!key) return;
    const el = document.querySelector('#stage ' + key);
    if (el) el.focus({ preventScroll: true });
  }

  SC.render = function () {
    const el = document.getElementById('scene');
    const ui = document.getElementById('scene-ui');
    const sc = BB.SCENES[BB.S.location];
    const fk = focusKey();
    el.className = 'scene scene-' + BB.S.location;
    ui.innerHTML = '';
    el.innerHTML = sc.render();
    if (sc.renderUI) ui.innerHTML = sc.renderUI();
    if (sc.mounted) sc.mounted(el, ui);
    lastSig = signature();
    restoreFocus(fk);
  };

  SC.renderUI = function () {
    const sc = BB.SCENES[BB.S.location];
    const ui = document.getElementById('scene-ui');
    if (!sc || !sc.renderUI) return;
    const fk = focusKey();
    ui.innerHTML = sc.renderUI();
    restoreFocus(fk);
  };

  /** Cheap refresh after any state change: full redraw only if the scene's contents changed. */
  SC.softRefresh = function () {
    if (!BB.S.started || busy || !document.getElementById('game').classList.contains('is-active')) return;
    if (signature() !== lastSig) SC.render();
    else {
      SC.renderUI();
      SC.refreshIndicators();
    }
  };

  SC.refresh = function () {
    if (!BB.S.started || !document.getElementById('game').classList.contains('is-active')) return;
    SC.render();
    BB.ui.updateHUD();
  };

  SC.refreshIndicators = function () {
    BB.$$('.scene .actor').forEach((a) => a.classList.toggle('has-news', BB.hasNews(a.dataset.actor)));
  };

  /** Teleport to a location with a cute transition. */
  SC.go = async function (loc, o = {}) {
    if (busy || !BB.SCENES[loc]) return;
    if (loc === BB.S.location && !o.force) {
      BB.fx.toast(`You're already in the ${BB.LOCATIONS[loc].name}! ${BB.LOCATIONS[loc].icon}`, { dur: 1600 });
      return;
    }
    busy = true;
    if (BB.dialogue.isOpen()) BB.dialogue.close(false, true);
    if (BB.minigameOpen && BB.minigameClose) BB.minigameClose();
    BB.ui.closePanel();
    const tr = document.getElementById('transition');
    const L = BB.LOCATIONS[loc];
    tr.querySelector('.tr-card').innerHTML = `<span class="tr-icon" aria-hidden="true">${L.icon}</span><span>${L.full}</span>`;
    tr.hidden = false;
    const motion = BB.motionOK() && !o.instant;
    if (!o.instant) BB.audio.play('whoosh');
    tr.className = 'transition in';
    await BB.wait(motion ? 420 : o.instant ? 0 : 150);
    BB.S.location = loc;
    SC.render();
    BB.game.changed();
    const live = document.getElementById('sr-live');
    if (live) live.textContent = `You are now in the ${L.full}.`;
    await BB.wait(motion ? 350 : 60);
    tr.className = 'transition out';
    await BB.wait(motion ? 480 : 120);
    tr.className = 'transition';
    tr.hidden = true;
    busy = false;
    const sc = BB.SCENES[loc];
    if (sc.entered) sc.entered();
  };

  SC.isBusy = () => busy;

  /* =================================================================
     KITCHEN
     ================================================================= */
  BB.SCENES.kitchen = {
    render() {
      const s = BB.S;
      const g = BB.game;
      let h = `<div class="bg">${BB.art.kitchenBg('k')}</div>`;
      // calendar on the wall — Lisa's birthday is circled!
      h += BB.propHTML({
        act: 'calendar', l: 44, t: 13, w: 15, h: 17, cls: 'calendar', label: 'Calendar: September 26',
        html: `<div class="cal"><span class="cal-m">SEPT</span><b>26</b><span class="cal-n">LISA 16! ♥</span></div>`,
      });
      // cake station (or the finished cake under a glass dome)
      if (s.cake.done) {
        h += BB.propHTML({
          act: 'cakeDone', l: 30, b: 34, w: 22, h: 22, cls: 'station', label: 'The finished birthday cake',
          html: BB.art.cakeDome(BB.art.cake(cakeLook()).replace(/<\/?svg[^>]*>/g, '')),
        });
      } else {
        const ready = g.hasAll(BB.CAKE_ITEMS);
        h += BB.propHTML({
          act: 'cake', l: 30, b: 33, w: 24, h: 24, cls: 'station' + (ready && s.flags.plan ? ' glow' : ''),
          label: ready ? 'Mixing bowl: bake the birthday cake' : 'Mixing bowl (you need cake ingredients first)',
          html: BB.art.stationBowl(), tag: s.cake.step > 0 ? '🎂 Continue cake' : '🎂 Bake cake',
        });
      }
      // muffin tray
      const mReady = s.cake.done && g.hasAll(BB.MUFFIN_ITEMS) && !s.muffins.done;
      h += BB.propHTML({
        act: 'muffins', l: 51, b: 35, w: 24, h: 17, cls: 'station' + (mReady ? ' glow' : ''),
        label: s.muffins.done ? 'The finished muffins' : 'Muffin tray: make muffins',
        html: BB.art.stationTray(s.muffins.done ? BB.muffins.finalLooks() : null),
        tag: s.muffins.done ? '🧁 6/6 ready' : '🧁 Muffins',
      });
      if (g.where('poppy') === 'kitchen') h += BB.actorHTML('poppy', { l: 6, b: 3, h: 50 });
      if (g.where('hazel') === 'kitchen') h += BB.actorHTML('hazel', { l: 73, b: 3, h: 48 });
      if (g.where('poppy') !== 'kitchen') {
        h += BB.decoHTML({ l: 8, b: 6, w: 34, cls: 'note-card', html: '<p>Gone to the party room!<br>— Poppy 🧁</p>' });
      }
      return h;
    },
    onAction(act, el) {
      const s = BB.S;
      const g = BB.game;
      const poppy = document.querySelector('[data-actor="poppy"]');
      if (act === 'calendar') {
        BB.audio.play('soft');
        BB.fx.bark(el, 'September 26 — LISA’S 16th BIRTHDAY!!! (Circled four times by Hazel.)');
      } else if (act === 'cake') {
        if (!s.flags.plan) {
          BB.audio.play('error');
          BB.talk('hazel');
          return;
        }
        if (!g.hasAll(BB.CAKE_ITEMS)) {
          BB.audio.play('error');
          const miss = g.missing(BB.CAKE_ITEMS).map((id) => BB.ITEMS[id].name.toLowerCase());
          BB.fx.bark(poppy || el, `We still need: ${miss.join(', ')}! The Carrot Market has everything.`, 3600);
          BB.replay(el, 'shake', 500);
          return;
        }
        BB.audio.play('pop');
        BB.cake.open();
      } else if (act === 'cakeDone') {
        BB.audio.play('soft');
        BB.fx.sparkleAt(el, 10);
        BB.fx.bark(poppy || el, 'Isn’t it BEAUTIFUL? It’s cooling. Nobody touch it. Especially Milo.');
      } else if (act === 'muffins') {
        if (s.muffins.done) {
          BB.audio.play('soft');
          BB.fx.bark(poppy || el, 'Six perfect muffins! Well, five perfect and one “rustic”.');
          return;
        }
        if (!s.cake.done) {
          BB.audio.play('error');
          BB.fx.bark(poppy || el, 'Cake first, muffins second! The cake is the star of the show.');
          return;
        }
        if (!g.hasAll(BB.MUFFIN_ITEMS)) {
          BB.audio.play('error');
          const miss = g.missing(BB.MUFFIN_ITEMS).map((id) => BB.ITEMS[id].name.toLowerCase());
          BB.fx.bark(poppy || el, `For muffins we need ${miss.join(' and ')} from the Carrot Market!`, 3200);
          BB.replay(el, 'shake', 500);
          return;
        }
        BB.audio.play('pop');
        BB.muffins.open();
      }
    },
    entered() {
      maybeIntro();
    },
  };

  function cakeLook() {
    const c = BB.S.cake;
    return { frosting: c.frosting || 'vanilla', sprinkles: c.sprinkles, candles: c.candles || '16', lit: false };
  }
  BB.cakeLook = cakeLook;

  /** Hazel greets a brand-new player in the kitchen. */
  function maybeIntro() {
    if (!BB.S.flags.plan && !BB.S.flags.introShown && BB.S.location === 'kitchen') {
      BB.S.flags.introShown = true;
      setTimeout(() => {
        if (!BB.dialogue.isOpen() && BB.S.location === 'kitchen') BB.talk('hazel');
      }, 500);
    }
  }
  SC.maybeIntro = maybeIntro;

  /* =================================================================
     CARROT MARKET (shop)
     ================================================================= */
  function neededSet() {
    const s = BB.S;
    const need = new Set();
    if (!s.flags.plan) return need;
    BB.CAKE_ITEMS.forEach((id) => need.add(id));
    if (s.flags.knowsCake || s.cake.done) BB.MUFFIN_ITEMS.forEach((id) => need.add(id));
    BB.DECOR_REQ.forEach((id) => need.add(id));
    return need;
  }

  function productHTML(id, need) {
    const it = BB.ITEMS[id];
    const own = BB.game.owned(id);
    const star = need.has(id) && !own;
    return (
      `<button class="product${own ? ' owned' : ''}${star ? ' needed' : ''}" data-act="inspect" data-id="${id}" aria-label="${it.name}, ${it.price} carrots${own ? ', already in your bag' : ''}${star ? ', on your party list' : ''}">` +
      `<span class="p-icon">${BB.art.icon(id)}</span>` +
      `<span class="p-price">${own ? '✓' : it.price + '<i>🥕</i>'}</span>` +
      (star ? '<span class="p-star" aria-hidden="true">★</span>' : '') +
      `</button>`
    );
  }

  BB.SCENES.shop = {
    render() {
      const need = neededSet();
      let h = `<div class="bg">${BB.art.shopBg('s')}</div>`;
      h += `<div class="shelf shelf-left" style="${BB.st({ l: 1.5, b: 15, w: 47, h: 62, z: 5 })}"><div class="shelf-head">🧁 Baking</div><div class="shelf-grid">${BB.SHOP_BAKING.map((id) => productHTML(id, need)).join('')}</div></div>`;
      h += `<div class="shelf shelf-right" style="${BB.st({ r: 1.5, b: 15, w: 47, h: 62, z: 5 })}"><div class="shelf-head">🎉 Party</div><div class="shelf-grid">${BB.SHOP_PARTY.map((id) => productHTML(id, need)).join('')}</div></div>`;
      h += BB.actorHTML('shop', { l: 50, bu: 15, h: 46, z: 8, extra: `margin-left:calc(var(--u)*${(-46 * 200) / 262 / 2})` });
      h += BB.decoHTML({ l: 50, b: 0, w: 50, h: 26, cx: true, z: 12, cls: 'counter', html: BB.art.counter() });
      h += BB.propHTML({ act: 'register', l: 38, bu: 22, w: 13, h: 11, z: 13, label: 'Cash register', html: BB.art.register() });
      h += BB.propHTML({ act: 'bell', l: 56, bu: 23.5, w: 7, h: 6, z: 13, label: 'Shop bell', html: BB.art.bell() });
      return h;
    },
    onAction(act, el) {
      if (act === 'inspect') inspect(el.dataset.id, el);
      else if (act === 'bell') {
        BB.audio.play('ding');
        BB.replay(el, 'wiggle', 600);
        BB.fx.bark(document.querySelector('[data-actor="shop"]'), BB.pick(['Ding ding! Be right with you — oh, I’m already here.', 'The bell works! Business is officially open!']));
      } else if (act === 'register') {
        BB.audio.play('buy');
        BB.replay(el, 'wiggle', 600);
        BB.fx.bark(document.querySelector('[data-actor="shop"]'), 'Cha-ching! We only accept carrots. Fresh ones.');
      }
    },
    entered() {
      setTimeout(() => {
        const busyNow = BB.dialogue.isOpen() || document.querySelector('.modal-wrap') || BB.S.location !== 'shop';
        if (!BB.S.convos.shop_hello && !busyNow) BB.talk('shop');
      }, 120);
    },
  };

  /** Product inspection card with a BUY button. */
  function inspect(id, srcEl) {
    const it = BB.ITEMS[id];
    BB.audio.play('pop');
    const render = () => {
      const own = BB.game.owned(id);
      const afford = BB.S.carrots >= it.price;
      const need = neededSet().has(id);
      return (
        `<div class="inspect-icon">${BB.art.icon(id)}</div>` +
        `<h2 class="modal-title">${it.name}</h2>` +
        (need && !own ? `<div class="inspect-need">★ On your party list</div>` : '') +
        `<p class="inspect-desc">${it.desc}</p>` +
        `<div class="inspect-price">${it.price} ${BB.art.carrotIcon('inline-carrot')}<small>You have ${BB.S.carrots}</small></div>` +
        (own
          ? `<div class="inspect-owned">✓ Added to inventory</div><button class="btn btn-ghost wide" data-a="close">Close</button>`
          : `<button class="btn btn-primary btn-big wide buy-btn" data-a="buy" ${afford ? '' : 'aria-disabled="true"'}>BUY</button>` +
            (afford ? '' : `<p class="inspect-broke">You need ${it.price - BB.S.carrots} more 🥕 — try the 🌷 Garden!</p>`) +
            `<button class="btn btn-ghost wide" data-a="close">Maybe later</button>`)
      );
    };
    const m = BB.ui.modal(render(), { label: it.name, cls: 'inspect' });
    const modal = m.el.querySelector('.modal');
    m.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'close') {
        BB.audio.play('click');
        m.close();
        return;
      }
      if (b.dataset.a === 'buy') {
        const res = BB.game.buy(id, b);
        if (!res.ok) {
          BB.audio.play('error');
          BB.replay(b, 'shake', 500);
          if (res.reason === 'broke') {
            BB.fx.floatAt(b, `Need ${res.need} more 🥕`, 'spend');
            BB.fx.toast('🥕 A little short on carrots! The <b>Garden</b> is full of them.', { dur: 2600 });
          }
          return;
        }
        BB.fx.sparkleAt(b, 14);
        modal.innerHTML = render();
        BB.replay(modal.querySelector('.inspect-owned'), 'pop-in', 600);
        const c = modal.querySelector('[data-a="close"]');
        if (c) c.focus({ preventScroll: true });
        // update the shelf behind the modal
        const shelfBtn = document.querySelector(`.product[data-id="${id}"]`);
        if (shelfBtn) {
          const tmp = document.createElement('div');
          tmp.innerHTML = productHTML(id, neededSet());
          shelfBtn.replaceWith(tmp.firstChild);
        }
        const keeper = document.querySelector('[data-actor="shop"]');
        BB.replay(keeper, 'hop', 600);
        const quip = document.createElement('p');
        quip.className = 'inspect-quip';
        quip.innerHTML = `<b>Bramble:</b> “${BB.pick(['Excellent choice!', 'Lisa will love that!', 'Pleasure doing business!', 'Ooh, fancy!', 'A classic!'])}”`;
        modal.querySelector('.inspect-owned').after(quip);
      }
    });
  }
})(window.BB);
