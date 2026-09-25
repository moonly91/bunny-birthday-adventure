/* Bunny Birthday Adventure — party.js
   The Party Room: click-to-place decorating, the gathering, and hiding everyone
   for the surprise. The same room renderer is reused by the finale. */
(function (BB) {
  'use strict';

  const P = (BB.party = {});
  const G = () => BB.game;

  /* Decoration slots. Each accepts one item; some items can go in two places. */
  const SLOTS = {
    lights: { item: 'lights', st: 'left:0;right:0;top:3%;height:calc(var(--u)*8)', z: 3, label: 'along the ceiling' },
    banner: { item: 'banner', st: 'left:50%;top:9%;width:calc(var(--u)*92);height:calc(var(--u)*17);margin-left:calc(var(--u)*-46)', z: 4, label: 'across the wall' },
    balloonsL: { item: 'balloons', st: 'left:21%;bottom:28%;width:calc(var(--u)*18);height:calc(var(--u)*31)', z: 5, label: 'left corner' },
    balloonsR: { item: 'balloons', st: 'left:67%;bottom:28%;width:calc(var(--u)*18);height:calc(var(--u)*31)', z: 5, label: 'right corner' },
    table: { item: 'table', st: 'left:50%;bottom:calc(var(--u)*8);width:calc(var(--u)*46);height:calc(var(--u)*25.3);margin-left:calc(var(--u)*-23)', z: 18, label: 'middle of the room' },
    chairs: { item: 'chairs', st: 'left:50%;bottom:calc(var(--u)*5);width:calc(var(--u)*78);height:calc(var(--u)*20);margin-left:calc(var(--u)*-39)', z: 17, label: 'around the table' },
    flowersWin: { item: 'flowers', st: 'left:calc(3% + var(--u)*7.8);top:calc(7% + var(--u)*9.6);width:calc(var(--u)*8.4);height:calc(var(--u)*10)', z: 6, label: 'on the windowsill' },
    flowersTable: { item: 'flowers', needs: 'table', st: 'left:calc(50% - var(--u)*21);bottom:calc(var(--u)*25);width:calc(var(--u)*9);height:calc(var(--u)*10.8)', z: 21, label: 'on the cake table' },
    hats: { item: 'hats', st: 'left:calc(var(--u)*7);bottom:calc(var(--u)*11);width:calc(var(--u)*16);height:calc(var(--u)*8)', z: 26, label: 'on the armchair' },
    bows: { item: 'bows', needs: 'table', st: 'left:50%;bottom:calc(var(--u)*8);width:calc(var(--u)*46);height:calc(var(--u)*25.3);margin-left:calc(var(--u)*-23)', z: 19, label: 'on the tablecloth' },
    giftL: { item: 'gift', st: 'left:20%;bottom:calc(var(--u)*1);width:calc(var(--u)*13);height:calc(var(--u)*13)', z: 28, label: 'front left' },
    giftR: { item: 'gift', st: 'left:74%;bottom:calc(var(--u)*1);width:calc(var(--u)*13);height:calc(var(--u)*13)', z: 28, label: 'front right' },
    confetti: { item: 'confetti', st: 'left:3%;right:3%;bottom:0;height:calc(var(--u)*24)', z: 1, label: 'all over the floor' },
  };
  const ORDER = ['table', 'balloons', 'banner', 'chairs', 'flowers', 'gift', 'hats', 'bows', 'lights', 'confetti'];

  const COCO_SAYS = {
    balloons: 'Balloons! Finally, this room can breathe!',
    banner: 'HAPPY BIRTHDAY LISA! I’m not crying, you’re crying.',
    table: 'The cake table! The heart of every party.',
    chairs: 'Chairs! For sitting. And dramatic standing-on during speeches.',
    flowers: 'Flowers! Sunset colours. Chef’s kiss.',
    hats: 'Party hats! Mandatory. Even for Hazel.',
    confetti: 'CONFETTI! Future-bunny can clean that up.',
    gift: 'A present! Lisa’s going to shake it. Everyone shakes it.',
    bows: 'Bows on the tablecloth! Cute level: dangerously high.',
    lights: 'Fairy lights! It’s officially cozy in here.',
  };

  /* Where each bunny stands in the different phases. bu = bottom in stage units, b = bottom in %. */
  const POS = {
    normal: {
      coco: { l: 69, b: 27, h: 32, z: 7 },
      hazel: { l: 11, b: 27, h: 30, z: 7 },
      milo: { l: 0, dx: 1, bu: 9, h: 33, z: 27 },
    },
    ready: {
      hazel: { l: 11, b: 27, h: 30, z: 7 },
      milo: { l: 0, dx: 1, bu: 9, h: 33, z: 27 },
      poppy: { l: 50, dx: -30, bu: 22, h: 30, z: 12 },
      max: { l: 60, bu: 0, h: 36, z: 34 },
      bun: { l: 44, bu: 0, h: 28, z: 35 },
      coco: { l: 80, bu: 0, h: 38, z: 34 },
    },
    hide: {
      hazel: { l: 0, dx: -2, bu: 8, h: 32, z: 22, clip: 50 },
      milo: { l: 0, dx: 9, bu: 8, h: 32, z: 22, clip: 50 },
      poppy: { l: 50, dx: -22, bu: 16, h: 30, z: 16, clip: 50 },
      coco: { l: 50, dx: -1, bu: 16, h: 30, z: 16, clip: 50 },
      bun: { l: 57, dx: -1, bu: 7.5, h: 26, z: 23, clip: 50 },
      max: { l: 71, b: 29, h: 30, z: 7 },
    },
    party: {
      lisa: { l: 50, dx: -13, bu: 25, h: 34, z: 12 },
      hazel: { l: 12, bu: 0, h: 34, z: 33 },
      poppy: { l: 25, bu: 0, h: 34, z: 34 },
      milo: { l: 0, dx: 1, bu: 14, h: 33, z: 27 },
      coco: { l: 62, bu: 0, h: 34, z: 34 },
      bun: { l: 74, bu: 0, h: 28, z: 35 },
      max: { l: 84, bu: 0, h: 34, z: 33 },
    },
  };
  P.POS = POS;

  const HIDE_LINES = {
    hazel: 'Behind the armchair. Classic. Efficient.',
    milo: 'Fine. But my ear stays out. It’s my best feature.',
    poppy: 'Behind the table! I can guard the cake from here.',
    coco: 'Ooh, hiding next to the cake. It matches my outfit.',
    bun: 'Inside the box?! It’s like a burrow with corners!',
    max: 'I’ll get the lights. Everyone ready?',
  };

  P.posStyle = function (p) {
    const w = (p.h * 200) / 262;
    const s = [`left:calc(${p.l}% + var(--u)*${p.dx || 0})`, `width:calc(var(--u)*${w.toFixed(2)})`, `height:calc(var(--u)*${p.h})`, `z-index:${p.z || 20}`];
    s.push(p.bu != null ? `bottom:calc(var(--u)*${p.bu})` : `bottom:${p.b}%`);
    s.push(p.clip ? `clip-path:inset(0 0 ${p.clip}% 0)` : 'clip-path:none');
    return s.join(';');
  };

  function actor(id, p, o = {}) {
    const C = BB.CHARS[id];
    const news = !o.noNews && BB.hasNews(id) ? ' has-news' : '';
    return (
      `<button class="actor actor-${id}${news} ${o.cls || ''}" data-act="${o.act || 'talk'}" data-actor="${id}" style="${P.posStyle(p)}" aria-label="${o.label || `Talk to ${C.name}, ${C.role}`}">` +
      `<span class="actor-inner" style="--d:${(Math.random() * 1.5).toFixed(2)}s">${BB.art.bunny(id, o.art || {})}</span>` +
      `<span class="actor-name">${C.name}</span><span class="news" aria-hidden="true">!</span></button>`
    );
  }

  function slotArt(slot, item) {
    switch (item) {
      case 'lights': return BB.art.fairyLights();
      case 'banner': return BB.art.banner();
      case 'balloons': return BB.art.balloonCluster();
      case 'table': return BB.art.partyTable({ bows: false });
      case 'bows': return BB.art.tableBows();
      case 'chairs': return `<div class="chair-pair"><span>${BB.art.chair()}</span><span>${BB.art.chair(true)}</span></div>`;
      case 'flowers': return BB.art.vase();
      case 'hats': return BB.art.hatsPair();
      case 'gift': return slot === 'giftR' ? BB.art.giftBig('#9ad8ff', '#ff8fab') : BB.art.giftBig();
      case 'confetti': return BB.art.confettiFloor();
    }
    return '';
  }

  /** Room HTML. mode: 'game' | 'finale'. */
  P.roomHTML = function (prefix, mode) {
    const s = BB.S;
    let h = `<div class="bg">${BB.art.partyBg(prefix)}</div>`;
    h += BB.decoHTML({ l: 3, t: 7, w: 24, h: 33.6, z: 2, html: BB.art.window() });
    h += `<div class="deco door-wrap" style="${BB.st({ l: 83, b: 30, w: 20, h: 40, z: 2 })}" aria-hidden="true">${BB.art.door()}</div>`;
    h += BB.decoHTML({ l: 79.5, b: 44, w: 3, h: 4.5, z: 3, cls: 'switch-plate', html: '<i></i>' });
    h += BB.decoHTML({ l: 0, bu: 0, w: 30, h: 25.4, z: 25, cls: 'armchair', html: BB.art.armchair() });

    // placed decorations (bows are drawn over the table only if the table exists)
    Object.keys(SLOTS).forEach((slotId) => {
      const item = s.decor[slotId];
      if (!item) return;
      if (SLOTS[slotId].needs && !s.decor[SLOTS[slotId].needs]) return;
      const interactive = mode === 'game' && !s.finished && !s.surprise.hiding;
      h += `<${interactive ? 'button' : 'div'} class="placed placed-${item}" data-slot="${slotId}" ${interactive ? `data-act="placed" aria-label="${BB.ITEMS[item].name}, placed ${SLOTS[slotId].label}. Tap to move it."` : 'aria-hidden="true"'} style="${SLOTS[slotId].st};z-index:${SLOTS[slotId].z}">${slotArt(slotId, item)}</${interactive ? 'button' : 'div'}>`;
    });

    // cake & muffins on the table
    if (s.decor.table) {
      if (s.cake.done) {
        const look = BB.cakeLook();
        look.lit = mode === 'finale';
        h += `<div class="on-table cake-on-table" style="left:50%;bottom:calc(var(--u)*24);width:calc(var(--u)*18);height:calc(var(--u)*18);margin-left:calc(var(--u)*-9);z-index:20">${BB.art.cake(look)}</div>`;
      }
      if (s.muffins.done) {
        const m = BB.muffins.finalLooks();
        h += `<div class="on-table muffins-on-table" style="left:calc(50% + var(--u)*9.5);bottom:calc(var(--u)*25);width:calc(var(--u)*12);height:calc(var(--u)*7);z-index:21">${[0, 1, 2].map((i) => `<span>${BB.art.muffin(m[i])}</span>`).join('')}</div>`;
      }
    }

    // the surprise box (for Bun)
    if (s.surprise.hiding || s.surprise.done || mode === 'finale') {
      h += BB.decoHTML({ l: 57, bu: 0, w: 20, h: 17.5, z: 24, cls: 'surprise-box', html: BB.art.surpriseBox() });
    }
    return h;
  };

  /* ================= the game scene ================= */
  let selected = null;
  let trayOpen = null; // null = automatic (open until the room is decorated)
  let lastPhase = null;
  const isTrayOpen = () => (trayOpen == null ? !G().decorDone() : trayOpen);

  function phase() {
    const s = BB.S;
    if (s.finished) return 'finished';
    if (G().readyForSurprise()) return s.surprise.hiding ? 'hiding' : 'ready';
    return 'normal';
  }

  BB.SCENES.party = {
    render() {
      const s = BB.S;
      const ph = phase();
      if (ph !== lastPhase) {
        // new phase (e.g. everything is ready): tidy the tray away so the bunnies are easy to reach
        lastPhase = ph;
        trayOpen = null;
        selected = null;
      }
      let h = P.roomHTML('p', 'game');
      if (ph === 'normal') {
        ['coco', 'hazel', 'milo'].forEach((id) => {
          if (G().where(id) === 'party') h += actor(id, POS.normal[id]);
        });
      } else if (ph === 'ready') {
        BB.PARTY_BUNNIES.forEach((id) => (h += actor(id, POS.ready[id])));
      } else if (ph === 'hiding') {
        BB.PARTY_BUNNIES.forEach((id) => {
          const hidden = s.surprise.hidden[id];
          h += actor(id, hidden ? POS.hide[id] : POS.ready[id], {
            act: hidden ? 'hiddenBunny' : 'hide',
            cls: hidden ? 'is-hidden' : 'to-hide',
            noNews: true,
            label: hidden ? `${BB.CHARS[id].name} is hiding` : `Send ${BB.CHARS[id].name} to a hiding spot`,
          });
        });
      } else {
        h += actor('lisa', POS.party.lisa, { art: { partyHat: true } });
        BB.PARTY_BUNNIES.forEach((id) => (h += actor(id, POS.party[id], { cls: 'celebrating' })));
      }
      return h;
    },
    renderUI() {
      const ph = phase();
      if (ph === 'normal' || ph === 'ready') return trayHTML() + (selected ? markersHTML(selected) : '');
      if (ph === 'hiding') return hidingUI();
      if (ph === 'finished') return `<button class="btn btn-primary scene-btn" data-ui="replay">🎂 Replay the surprise</button>`;
      return '';
    },
    mounted(el, ui) {
      ui.onclick = (e) => {
        const b = e.target.closest('[data-ui]');
        if (!b) return;
        const a = b.dataset.ui;
        if (a === 'tray') trayClick(b.dataset.item, b);
        else if (a === 'place') place(selected, b.dataset.slot);
        else if (a === 'trayToggle') {
          trayOpen = !isTrayOpen();
          BB.audio.play(trayOpen ? 'open' : 'close');
          BB.scenes.renderUI();
          const f = document.querySelector(trayOpen ? '.decor-tray [data-ui]' : '.tray-pill');
          if (f) f.focus({ preventScroll: true });
        } else if (a === 'cancel') {
          selected = null;
          BB.audio.play('close');
          BB.scenes.refresh();
        } else if (a === 'lights') lightsOff(b);
        else if (a === 'replay') BB.finale.start(true);
      };
    },
    onAction(act, el) {
      if (act === 'placed') placedClick(el);
      else if (act === 'hide') hide(el.dataset.actor, el);
      else if (act === 'hiddenBunny') {
        BB.audio.play('squeak');
        BB.fx.bark(el, BB.pick(['Shhh!', 'I’m not here!', '*tiny giggle*', 'Is it now? Is it NOW?']), 1500);
      }
    },
    entered() {
      const s = BB.S;
      if (selected || (trayOpen !== null && G().decorDone())) {
        selected = null;
        if (G().decorDone()) trayOpen = null;
        BB.scenes.renderUI();
      }
      if (!s.convos.coco_hello && phase() === 'normal') {
        setTimeout(() => {
          if (!BB.dialogue.isOpen() && !document.querySelector('.modal-wrap') && BB.S.location === 'party') BB.talk('coco');
        }, 120);
      }
    },
  };

  /* ---------- decoration tray ---------- */
  function trayItems() {
    const s = BB.S;
    return ORDER.filter((id) => s.owned[id]);
  }

  function trayHTML() {
    const s = BB.S;
    const items = trayItems();
    const n = Math.min(5, G().decorCount());
    const done = G().decorDone();
    if (!selected && !isTrayOpen()) {
      return `<button class="tray-pill" data-ui="trayToggle" aria-expanded="false">🎨 Decorate <span class="tray-count${done ? ' ok' : ''}">${done ? '✓ decorated' : `${n}/5`}</span> ▴</button>`;
    }
    let inner;
    if (!s.convos.coco_hello) inner = `<p class="tray-empty">Say hi to <b>Coco</b> to start decorating!</p>`;
    else if (!items.length) inner = `<p class="tray-empty">No decorations yet — buy some at the 🛍️ Carrot Market!</p>`;
    else {
      inner = items
        .map((id) => {
          const placed = G().isPlaced(id);
          const sel = selected === id;
          return `<button class="tray-item${placed ? ' placed' : ''}${sel ? ' selected' : ''}" data-ui="tray" data-item="${id}" aria-pressed="${sel}" aria-label="${BB.ITEMS[id].name}${placed ? ' (placed — tap to move)' : ' — tap to place'}">${BB.art.icon(id)}<span>${BB.ITEMS[id].name}</span>${placed ? '<i class="tick">✓</i>' : ''}</button>`;
        })
        .join('');
    }
    return (
      `<div class="decor-tray${selected ? ' choosing' + (selected === 'lights' || selected === 'banner' ? '' : ' at-top') : ''}" role="group" aria-label="Decoration tray">` +
      `<div class="tray-head"><b>🎨 Decorate</b><span class="tray-count${done ? ' ok' : ''}">${done ? '✓ Room decorated!' : `${n}/5 placed`}</span>` +
      (selected
        ? `<button class="tray-cancel" data-ui="cancel">✕ Cancel</button>`
        : `<button class="tray-cancel" data-ui="trayToggle" aria-expanded="true">▾ Hide</button>`) +
      `</div>` +
      (selected
        ? `<p class="tray-hint">Where should the <b>${BB.ITEMS[selected].name.toLowerCase()}</b> go? Tap a glowing spot!</p>`
        : `<div class="tray-items">${inner}</div>`) +
      `</div>`
    );
  }

  function validSlots(item) {
    const s = BB.S;
    return Object.keys(SLOTS).filter((id) => {
      const sl = SLOTS[id];
      if (sl.item !== item) return false;
      if (sl.needs && !s.decor[sl.needs]) return false;
      return !s.decor[id] || s.decor[id] === item;
    });
  }

  const MARK = {
    lights: { l: 50, t: 5 }, banner: { l: 50, t: 16 }, balloonsL: { l: 26, b: 42 }, balloonsR: { l: 72, b: 42 },
    table: { l: 50, bu: 18 }, chairs: { l: 50, bu: 12 }, flowersWin: { l: 10.5, t: 30 }, flowersTable: { l: 40, bu: 30 },
    hats: { l: 9, bu: 14 }, bows: { l: 50, bu: 16 }, giftL: { l: 24, bu: 6 }, giftR: { l: 78, bu: 6 }, confetti: { l: 50, bu: 4 },
  };

  function markersHTML(item) {
    return validSlots(item)
      .map((id) => {
        const m = MARK[id];
        const pos = `left:${m.l}%;${m.t != null ? `top:${m.t}%` : m.b != null ? `bottom:${m.b}%` : `bottom:calc(var(--u)*${m.bu})`}`;
        const cur = BB.S.decor[id] === item;
        return `<button class="slot-marker${cur ? ' current' : ''}" data-ui="place" data-slot="${id}" style="${pos}" aria-label="Place ${BB.ITEMS[item].name} ${SLOTS[id].label}"><span>${cur ? '✓' : '+'}</span><em>${SLOTS[id].label}</em></button>`;
      })
      .join('');
  }

  function coco() {
    return document.querySelector('.scene [data-actor="coco"]');
  }

  function trayClick(item, btn) {
    const slots = validSlots(item);
    if (!slots.length) {
      BB.audio.play('error');
      BB.replay(btn, 'shake', 500);
      BB.fx.bark(coco() || btn, 'Place the cake table first — that goes on top of it!');
      return;
    }
    BB.audio.play('click');
    if (slots.length === 1 && !G().isPlaced(item)) {
      place(item, slots[0]);
      return;
    }
    selected = selected === item ? null : item;
    BB.scenes.renderUI();
    if (selected) {
      const first = document.querySelector('.slot-marker');
      if (first) first.focus({ preventScroll: true });
    }
  }

  function placedClick(el) {
    const item = BB.S.decor[el.dataset.slot];
    const alt = validSlots(item);
    BB.audio.play('soft');
    BB.replay(el, 'wiggle', 600);
    if (alt.length > 1) {
      selected = item;
      BB.scenes.renderUI();
      BB.fx.toast(`Choose a new spot for the ${BB.ITEMS[item].name.toLowerCase()}!`, { dur: 1800 });
    } else {
      BB.fx.bark(coco() || el, BB.pick(['Perfect right there!', 'Don’t touch it, it’s perfect!', 'Gorgeous. I have excellent taste.']));
    }
  }

  function place(item, slotId) {
    if (!item || !SLOTS[slotId]) return;
    const s = BB.S;
    const wasPlaced = G().isPlaced(item);
    Object.keys(s.decor).forEach((k) => {
      if (s.decor[k] === item) delete s.decor[k];
    });
    s.decor[slotId] = item;
    // bows/flowers on the table need the table; if the table ever moves they stay with it
    selected = null;
    BB.audio.play('place');
    BB.scenes.refresh();
    const el = document.querySelector(`.placed[data-slot="${slotId}"]`);
    if (el) {
      BB.replay(el, 'placed-pop', 800);
      BB.fx.sparkleAt(el, 16);
    }
    if (!wasPlaced) setTimeout(() => BB.fx.bark(coco() || el, COCO_SAYS[item]), 200);
    const before = G().taskDone('decorate');
    BB.game.changed();
    if (!before && G().taskDone('decorate')) {
      trayOpen = null; // collapses automatically now that the room is decorated
      setTimeout(() => {
        const c = coco();
        if (c) {
          BB.replay(c, 'hop', 700);
          BB.fx.bark(c, 'It’s PERFECT! Lisa is going to LOVE it!', 3200);
        }
        BB.scenes.refresh();
      }, 1400);
    }
  }

  /* ---------- hiding for the surprise ---------- */
  function hidingUI() {
    const n = Object.keys(BB.S.surprise.hidden).length;
    const all = n >= 6;
    return (
      `<div class="hide-banner" role="status"><b>🤫 Hide everyone!</b><span>${all ? 'Everyone is hidden. Lisa is coming…' : `Tap each bunny to send them to a hiding spot (${n}/6)`}</span></div>` +
      (all ? `<button class="btn btn-primary btn-big scene-btn lights-btn" data-ui="lights">💡 Lights off — here she comes!</button>` : '')
    );
  }

  P.startHiding = function () {
    BB.S.surprise.hiding = true;
    BB.store.save();
    BB.scenes.refresh();
    const box = document.querySelector('.surprise-box');
    if (box) BB.replay(box, 'placed-pop', 800);
    BB.fx.toast('🤫 Tap each bunny to send them to their hiding spot!', { type: 'info', dur: 3500 });
  };

  function hide(id, el) {
    const s = BB.S;
    if (id === 'milo' && !s.flags.miloRefused) {
      s.flags.miloRefused = true;
      BB.audio.play('oops');
      BB.replay(el, 'shake', 500);
      BB.fx.bark(el, 'Hide? But then how will everyone SEE me?', 2400);
      return;
    }
    s.surprise.hidden[id] = true;
    BB.audio.play('boing');
    const target = POS.hide[id];
    el.classList.add('moving');
    el.dataset.act = 'hiddenBunny';
    el.classList.remove('to-hide', 'has-news');
    el.style.cssText = P.posStyle(Object.assign({}, target, { clip: 0, z: 40 }));
    BB.fx.bark(el, HIDE_LINES[id], 2000);
    setTimeout(() => {
      el.style.cssText = P.posStyle(target);
      el.classList.add('is-hidden');
      el.classList.remove('moving');
      el.setAttribute('aria-label', `${BB.CHARS[id].name} is hiding`);
    }, BB.motionOK() ? 520 : 0);
    BB.game.changed();
    const ui = document.getElementById('scene-ui');
    setTimeout(() => {
      ui.innerHTML = hidingUI();
      const lb = ui.querySelector('.lights-btn');
      if (lb) {
        BB.audio.play('task');
        lb.focus({ preventScroll: true });
      }
    }, 550);
  }

  function lightsOff(btn) {
    btn.disabled = true;
    BB.audio.play('switch');
    BB.S.surprise.done = true;
    BB.game.changed();
    setTimeout(() => BB.finale.start(), 900);
  }
})(window.BB);
