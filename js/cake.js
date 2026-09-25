/* Bunny Birthday Adventure — cake.js
   A shared mini-game shell (BB.mg) and the 12-step birthday cake baking game:
   crack eggs, pour milk (hold!), scoop flour, butter, stir, chocolate, pour,
   bake with a countdown, take it out, frost, sprinkle and add the "16" candles.
   Mistakes are never punished — Poppy just says something funny. */
(function (BB) {
  'use strict';

  /* ================= mini-game shell ================= */
  const MG = (BB.mg = {});
  let session = 0;
  let onClose = null;

  MG.open = function (html, o = {}) {
    session += 1;
    const root = document.getElementById('minigame');
    BB.ui.closePanel();
    if (BB.dialogue.isOpen()) BB.dialogue.close(false, true);
    root.innerHTML = html;
    root.hidden = false;
    root.className = 'minigame ' + (o.cls || '');
    requestAnimationFrame(() => root.classList.add('open'));
    BB.minigameOpen = true;
    BB.minigameClose = () => MG.close();
    onClose = o.onClose || null;
    BB.audio.play('open');
    root.querySelector('.mg-back').addEventListener('click', () => {
      BB.audio.play('click');
      MG.close();
    });
    return { root, id: session };
  };

  MG.alive = (id) => id === session && BB.minigameOpen;

  MG.close = function () {
    if (!BB.minigameOpen) return;
    session += 1;
    BB.minigameOpen = false;
    const root = document.getElementById('minigame');
    root.classList.remove('open');
    setTimeout(() => {
      if (!BB.minigameOpen) {
        root.hidden = true;
        root.innerHTML = '';
      }
    }, 280);
    const cb = onClose;
    onClose = null;
    if (cb) cb();
    BB.scenes.refresh();
    BB.store.save();
  };

  MG.shell = (title, icon, cls) =>
    `<div class="mg-card ${cls}" role="dialog" aria-label="${BB.esc(title)}">` +
    `<header class="mg-head"><button class="btn btn-ghost mg-back" aria-label="Back to the kitchen">← Kitchen</button>` +
    `<h2><span aria-hidden="true">${icon}</span> ${title}</h2><div class="mg-steps" aria-live="polite"></div></header>` +
    `<div class="mg-coach"><div class="mg-portrait">${BB.art.bunny('poppy', { portrait: true })}</div><p class="mg-say" aria-live="polite"></p></div>` +
    `<div class="mg-body"></div></div>`;

  MG.say = function (root, text, mood) {
    const p = root.querySelector('.mg-say');
    if (!p) return;
    p.textContent = text;
    const coach = root.querySelector('.mg-coach');
    coach.classList.remove('oops', 'happy');
    void coach.offsetWidth;
    if (mood) coach.classList.add(mood);
    BB.replay(root.querySelector('.mg-portrait'), 'talk-bob', 700);
  };

  MG.steps = function (root, i, total, label) {
    const el = root.querySelector('.mg-steps');
    el.innerHTML = `<span>${label || `Step ${Math.min(i + 1, total)} / ${total}`}</span><div class="dots" aria-hidden="true">${Array.from({ length: total }, (_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('')}</div>`;
  };

  /** Big centred text like "3… 2… 1…" */
  MG.bigText = function (root, text, cls = '') {
    const b = document.createElement('div');
    b.className = 'mg-big ' + cls;
    b.textContent = text;
    root.querySelector('.mg-card').appendChild(b);
    setTimeout(() => b.remove(), 900);
  };

  /* ================= the cake ================= */
  const STEPS = [
    { id: 'eggs', ing: 'eggs', say: 'First, crack two eggs into the bowl! Tap the eggs.' },
    { id: 'milk', ing: 'milk', say: 'Now the milk! HOLD the pour button and let go in the golden zone.' },
    { id: 'flour', ing: 'flour', say: 'Three scoops of flour! Tap the flour bag three times.' },
    { id: 'butter', ing: 'butter', say: 'In goes the butter! Tap it.' },
    { id: 'mix', say: 'Mix, mix, MIX! Tap STIR again and again — or drag circles around the bowl.' },
    { id: 'chocolate', ing: 'chocolate', say: 'Now the best part… CHOCOLATE! Tap it!' },
    { id: 'pour', say: 'Beautiful batter! Now pour it into the cake tin.' },
    { id: 'oven', say: 'Into the oven it goes! Put the tin in, then turn the dial.' },
    { id: 'takeout', say: 'DING! Grab the oven mitts and take the cake out!' },
    { id: 'frosting', say: 'Frosting time! Which flavour should we use?' },
    { id: 'sprinkles', ing: 'sprinkles', say: 'Sprinkles! Tap SHAKE as many times as you like!' },
    { id: 'candles', ing: 'candles', say: 'Last step: the candles! Lisa is turning 16 — tap the 1 and the 6.' },
  ];

  const OOPS = {
    flour: ['Oops! That’s a LOT of flour.', 'Flour everywhere! It’s fine. It’s basically decoration.'],
    eggs: ['More eggs? This cake is going to be 90% omelette.', 'The eggs are done! Put the carton down slowly…'],
    milk: ['Easy there — it’s a cake, not a smoothie!', 'We’ve had our milk! Moo-ving on.'],
    butter: ['The butter’s already in! It’s been thoroughly buttered.', 'More butter?! …Tempting. But no.'],
    chocolate: ['Chocolate already? Bold. But patience!', 'I know, I KNOW. I also want to eat it straight.'],
    sprinkles: ['Sprinkles go on at the END. It’s the law.', 'Not yet! The sprinkles are the grand finale.'],
    candles: ['Candles in the batter?! Lisa would find them in her slice!', 'Candles come last! Very last.'],
  };

  let st; // per-open state (sub-progress)
  let root;
  let sid;

  function S() {
    return BB.S.cake;
  }

  BB.cake = {};

  BB.cake.open = function () {
    if (S().done) return;
    const r = MG.open(MG.shell('Lisa’s Birthday Cake', '🎂', 'cake-game'), { cls: 'mg-cake' });
    root = r.root;
    sid = r.id;
    st = { eggs: 0, milk: 0, flour: 0, mix: 0, frost: 0, shakes: S().sprinkles || 0, candles: [], pouring: false, baking: false };
    // resuming mid-way: fill in the sub-progress that earlier steps imply
    const step = S().step;
    if (step > 0) st.eggs = 2;
    if (step > 1) st.milk = 0.72;
    if (step > 2) st.flour = 3;
    if (step > 4) st.mix = 1;
    if (step > 9) st.frost = 3;
    const body = root.querySelector('.mg-body');
    body.innerHTML =
      `<div class="mg-shelf" role="group" aria-label="Ingredients">${BB.CAKE_ITEMS.map((id) => `<button class="ing" data-ing="${id}">${BB.art.icon(id)}<span>${BB.ITEMS[id].name.replace('Birthday ', '')}</span></button>`).join('')}</div>` +
      `<div class="mg-work"></div>`;
    body.querySelector('.mg-shelf').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ing]');
      if (b) ingredient(b.dataset.ing, b);
    });
    bindWork(body.querySelector('.mg-work'));
    render(true);
    if (step === 0) MG.say(root, 'Welcome to the kitchen, helper! ' + STEPS[0].say, 'happy');
    else MG.say(root, 'Welcome back! Let’s keep going. ' + STEPS[step].say, 'happy');
  };

  function cur() {
    return STEPS[Math.min(S().step, STEPS.length - 1)];
  }

  /** Advance to the next step after a short beat. Input is locked meanwhile so fast taps can't skip steps. */
  function next(delay = 700) {
    st.lock = true;
    const mySid = sid;
    setTimeout(() => {
      if (!MG.alive(mySid)) return;
      st.lock = false;
      S().step += 1;
      BB.game.changed(true);
      BB.store.save();
      if (S().step >= STEPS.length) return finish();
      render(true);
      MG.say(root, cur().say);
    }, delay);
  }

  function oops(ing, el) {
    BB.S.stats.mistakes += 1;
    BB.audio.play('oops');
    MG.say(root, BB.pick(OOPS[ing] || ['Hmm, not that one right now!']), 'oops');
    if (el) BB.replay(el, 'shake', 500);
    if (ing === 'flour') {
      const c = BB.centerOf(root.querySelector('.bowl-area') || el);
      BB.audio.play('puff');
      BB.fx.puff(c.x, c.y, 12);
    }
  }

  /* ---------- rendering ---------- */
  function render(fresh) {
    const step = S().step;
    MG.steps(root, step, STEPS.length);
    BB.$$('.ing', root).forEach((b) => {
      const id = b.dataset.ing;
      const idx = STEPS.findIndex((s) => s.ing === id);
      b.classList.toggle('next', cur().ing === id);
      b.classList.toggle('used', idx > -1 && idx < step);
      b.setAttribute('aria-label', `${BB.ITEMS[id].name}${cur().ing === id ? ' — use this now' : idx < step ? ' (already added)' : ''}`);
    });
    const work = root.querySelector('.mg-work');
    const view = step <= 6 ? 'bowl' : step <= 8 ? 'oven' : 'deco';
    if (fresh || work.dataset.view !== view) {
      work.dataset.view = view;
      work.innerHTML = view === 'bowl' ? bowlView() : view === 'oven' ? ovenView() : decoView();
      if (view === 'bowl') bindStirDrag(work.querySelector('.bowl-area'));
    }
    updateWork(work, view);
  }

  function bowlContents() {
    const step = S().step;
    let s = '';
    const choc = step > 5;
    if (st.mix > 0 || choc) {
      const smooth = choc ? 1 : st.mix;
      const col = choc ? '#8b5a3c' : mixColor(smooth);
      s += `<ellipse cx="120" cy="64" rx="92" ry="20" fill="${col}"/>`;
      s += `<path d="M60 62 Q120 44 180 62 M80 70 Q120 58 160 70" stroke="rgba(255,255,255,.35)" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      const lumps = choc ? 0 : Math.round((1 - smooth) * 7);
      for (let i = 0; i < lumps; i++) s += `<circle cx="${70 + ((i * 37) % 100)}" cy="${56 + ((i * 13) % 14)}" r="${5 + (i % 3)}" fill="${i % 2 ? '#fff8ec' : '#ffd66b'}"/>`;
      return s;
    }
    if (st.milk > 0) s += `<ellipse cx="120" cy="${68 - st.milk * 6}" rx="${60 + st.milk * 32}" ry="${12 + st.milk * 8}" fill="#fbf4e4"/>`;
    for (let i = 0; i < st.eggs; i++) {
      const x = 96 + i * 48;
      s += `<ellipse cx="${x}" cy="62" rx="16" ry="8" fill="#fff" opacity=".9"/><circle cx="${x}" cy="61" r="7" fill="#ffc62e" stroke="#e8a21a" stroke-width="1.5"/>`;
    }
    for (let i = 0; i < st.flour; i++) s += `<ellipse cx="${80 + i * 38}" cy="${56 - (i % 2) * 3}" rx="22" ry="11" fill="#fffdf8" stroke="#eee3d0" stroke-width="2"/>`;
    if (st.butter || step > 3) s += `<g transform="translate(150 50) rotate(-8)"><rect width="26" height="16" rx="3" fill="#ffe27a" stroke="#6b3f2a" stroke-width="2"/></g>`;
    return s;
  }

  function mixColor(t) {
    const a = [245, 230, 200];
    const b = [241, 207, 143];
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  function bowlView() {
    return (
      `<div class="bowl-stage">` +
      `<div class="bowl-area" role="img" aria-label="Mixing bowl">${BB.art.bowl({ contents: '' })}<div class="spoon" aria-hidden="true"></div></div>` +
      `<div class="tin-wait">${BB.art.tin(0)}</div>` +
      `</div>` +
      `<div class="work-actions"></div>`
    );
  }

  function ovenView() {
    return (
      `<div class="oven-stage">` +
      `<button class="oven-btn" aria-label="Oven">${BB.art.oven()}</button>` +
      `<button class="tin-btn">${BB.art.tin(1, '#8b5a3c')}</button>` +
      `<div class="baking-text" aria-live="polite"></div>` +
      `</div><div class="work-actions"></div>`
    );
  }

  function decoView() {
    return `<div class="deco-stage"><button class="cake-btn" aria-label="The cake"></button><div class="sprinkle-rain" aria-hidden="true"></div></div><div class="work-actions"></div>`;
  }

  function updateWork(work, view) {
    const step = S().step;
    const act = work.querySelector('.work-actions');
    if (view === 'bowl') {
      const bc = work.querySelector('.bowl-contents');
      if (bc) bc.innerHTML = bowlContents();
      const id = cur().id;
      work.querySelector('.spoon').classList.toggle('show', id === 'mix');
      if (id === 'milk') {
        act.innerHTML =
          `<div class="meter milk-meter" aria-hidden="true"><div class="zone"></div><div class="fill" style="height:${Math.min(100, (st.milk / 1.15) * 100)}%"></div><span>🥛</span></div>` +
          `<button class="btn btn-primary btn-big hold-btn" data-do="pour">🥛 Hold to pour</button>`;
        bindHold(act.querySelector('.hold-btn'));
      } else if (id === 'mix') {
        act.innerHTML =
          `<div class="meter mix-meter" aria-hidden="true"><div class="fill" style="width:${Math.round(st.mix * 100)}%"></div><span>Smoothness ${Math.round(st.mix * 100)}%</span></div>` +
          `<button class="btn btn-primary btn-big" data-do="stir">🥄 STIR!</button>`;
      } else if (id === 'pour') {
        act.innerHTML = `<button class="btn btn-primary btn-big" data-do="pourTin">🫗 Pour into the tin</button>`;
      } else {
        act.innerHTML = `<p class="work-hint">👈 Use the ingredients on the shelf</p>`;
      }
    } else if (view === 'oven') {
      const tin = work.querySelector('.tin-btn');
      const oven = work.querySelector('.oven-btn');
      tin.hidden = step !== 7 || st.inOven;
      if (step === 7 && !st.inOven) act.innerHTML = `<p class="work-hint">Tap the cake tin to put it in the oven!</p>`;
      else if (step === 7 && !st.baking) act.innerHTML = `<button class="btn btn-primary btn-big" data-do="dial">🔥 Turn the dial — bake!</button>`;
      else if (step === 7) act.innerHTML = `<p class="work-hint">Baking… no peeking! (Okay, a little peeking.)</p>`;
      else act.innerHTML = `<button class="btn btn-primary btn-big" data-do="takeout">🧤 Take the cake out!</button>`;
      oven.classList.toggle('ready', step === 8);
      const inside = oven.querySelector('.oven-inside');
      if (st.inOven || step === 8) inside.innerHTML = ovenCake(step === 8 ? 1 : st.rise || 0);
      else inside.innerHTML = '';
      oven.querySelector('.oven-glow').setAttribute('opacity', st.baking ? '.55' : step === 8 ? '.25' : '0');
    } else {
      const cakeBtn = work.querySelector('.cake-btn');
      const id = cur().id;
      const look = { frosting: S().frosting, frostLevel: st.frost, sprinkles: id === 'frosting' ? 0 : st.shakes, candles: null };
      if (id === 'candles' && st.candles.length) look.candles = st.candles.length === 2 ? st.candles.join('') : null;
      cakeBtn.innerHTML = BB.art.cake(look) + (id === 'candles' && st.candles.length === 1 ? `<span class="one-candle">${st.candles[0]}</span>` : '');
      cakeBtn.classList.toggle('tappable', id === 'frosting' && S().frosting && st.frost < 3);
      if (id === 'frosting' && !S().frosting) {
        const tip = BB.S.flags.maxTip;
        act.innerHTML =
          `<div class="choice-cards">` +
          [['chocolate', 'Chocolate'], ['vanilla', 'Vanilla'], ['strawberry', 'Strawberry']]
            .map(([k, n]) => `<button class="choice-card" data-frost="${k}"><span class="swatch" style="background:${BB.art.FROST[k]}"></span><b>${n}</b>${k === 'chocolate' && tip ? '<small>💡 Max: Lisa loves this!</small>' : ''}</button>`)
            .join('') +
          `</div>`;
      } else if (id === 'frosting') {
        act.innerHTML = `<p class="work-hint">Tap the cake to spread the frosting! (${st.frost}/3)</p>`;
      } else if (id === 'sprinkles') {
        act.innerHTML =
          `<div class="sprinkle-count">✨ Sprinkles: <b>${st.shakes}</b> shake${st.shakes === 1 ? '' : 's'}${st.shakes >= 8 ? ' — Lisa-level!' : ''}</div>` +
          `<button class="btn btn-primary btn-big" data-do="shake">${BB.art.icon('sprinkles', 'btn-ico')} SHAKE!</button>` +
          (st.shakes >= 3 ? `<button class="btn btn-ghost" data-do="doneSprinkles">✓ Done sprinkling</button>` : '');
      } else if (id === 'candles') {
        const used = st.candles;
        act.innerHTML =
          `<div class="candle-picks">` +
          ['1', '6'].map((d) => `<button class="candle-pick" data-candle="${d}" ${used.includes(d) ? 'disabled' : ''} aria-label="Candle number ${d}"><b>${d}</b><i aria-hidden="true"></i></button>`).join('') +
          `</div>`;
      } else act.innerHTML = '';
    }
  }

  function ovenCake(rise) {
    const h = 8 + rise * 22;
    return `<g transform="translate(110 168)"><rect x="-44" y="-18" width="88" height="18" rx="4" fill="#b9c3cc"/><path d="M-40 -18 Q-40 ${-18 - h} 0 ${-18 - h - 4} Q40 ${-18 - h} 40 -18 Z" fill="#8b5a3c"/></g>`;
  }

  /* ---------- interactions ---------- */
  /** One delegated listener for the whole workspace (its contents change per step). */
  function bindWork(work) {
    work.addEventListener('click', (e) => {
      const d = e.target.closest('[data-do]');
      if (d) return doAction(d.dataset.do, d);
      const fr = e.target.closest('[data-frost]');
      if (fr) return chooseFrosting(fr.dataset.frost, fr);
      const cd = e.target.closest('[data-candle]');
      if (cd) return placeCandle(cd.dataset.candle, cd);
      if (e.target.closest('.tin-btn')) return tinToOven(e.target.closest('.tin-btn'));
      if (e.target.closest('.oven-btn')) return ovenClick();
      if (e.target.closest('.cake-btn')) return cakeTap(e.target.closest('.cake-btn'));
    });
  }

  function ingredient(id, btn) {
    const c = cur();
    if (st.lock || st.pouring || st.baking) return;
    if (c.ing !== id) return oops(id, btn);
    const bowl = root.querySelector('.bowl-area');
    switch (id) {
      case 'eggs':
        st.eggs += 1;
        BB.audio.play('crack');
        BB.fx.fly(btn, bowl, BB.art.icon('eggs'));
        render();
        MG.say(root, st.eggs === 1 ? 'Crack! One more!' : 'Two perfect cracks! Not a single shell. I’m so proud.', 'happy');
        if (st.eggs >= 2) next(800);
        break;
      case 'milk':
        MG.say(root, 'Hold the big POUR button below! Let go when the milk reaches the golden zone.');
        BB.replay(root.querySelector('.hold-btn'), 'wiggle', 600);
        break;
      case 'flour': {
        if (st.flour >= 3) return oops('flour', btn);
        st.flour += 1;
        BB.audio.play('puff');
        const c2 = BB.centerOf(bowl);
        BB.fx.fly(btn, bowl, BB.art.icon('flour'), () => BB.fx.puff(c2.x, c2.y - 20, 5));
        render();
        MG.say(root, ['One scoop!', 'Two scoops!', 'Three! Perfectly fluffy.'][st.flour - 1], 'happy');
        if (st.flour >= 3) next(900);
        break;
      }
      case 'butter':
        BB.audio.play('plop');
        st.butter = true;
        BB.fx.fly(btn, bowl, BB.art.icon('butter'), () => render());
        MG.say(root, 'Plop! Golden, buttery goodness.', 'happy');
        next(1000);
        break;
      case 'chocolate':
        BB.audio.play('plop');
        BB.fx.fly(btn, bowl, BB.art.icon('chocolate'));
        MG.say(root, 'Look at that swirl! It smells like happiness in here.', 'happy');
        setTimeout(() => bowl && bowl.classList.add('swirl'), 300);
        next(1300);
        break;
      case 'sprinkles':
        doAction('shake', root.querySelector('[data-do="shake"]') || btn);
        break;
      case 'candles':
        MG.say(root, 'Tap the 1 and the 6 below to put them on the cake!');
        break;
    }
  }

  function doAction(a, el) {
    if (st.lock) return;
    const c = cur().id;
    if (a === 'stir' && c === 'mix') stir(0.09, el);
    else if (a === 'pourTin' && c === 'pour') pourIntoTin();
    else if (a === 'dial' && c === 'oven') bake();
    else if (a === 'takeout' && c === 'takeout') takeOut();
    else if (a === 'shake' && c === 'sprinkles') shake(el);
    else if (a === 'doneSprinkles' && c === 'sprinkles') {
      S().sprinkles = st.shakes;
      BB.audio.play('pop');
      MG.say(root, st.shakes >= 8 ? 'LISA-LEVEL SPRINKLES achieved! Max would be proud.' : 'Pretty! Tasteful. Elegant. Sprinkly.', 'happy');
      next(900);
    }
  }

  /* milk: press and hold */
  function bindHold(btn) {
    if (!btn) return;
    let raf = null;
    let last = 0;
    let stopSound = null;
    const start = (e) => {
      if (e) e.preventDefault();
      if (st.pouring || cur().id !== 'milk') return;
      st.pouring = true;
      btn.classList.add('holding');
      stopSound = BB.audio.loop('pour');
      last = performance.now();
      const loop = (t) => {
        if (!st.pouring) return;
        st.milk = Math.min(1.2, st.milk + ((t - last) / 1000) * 0.42);
        last = t;
        const fill = root.querySelector('.milk-meter .fill');
        if (fill) fill.style.height = Math.min(100, (st.milk / 1.15) * 100) + '%';
        const bc = root.querySelector('.bowl-contents');
        if (bc) bc.innerHTML = bowlContents();
        if (st.milk >= 1.15) return end();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      root.querySelector('.bowl-area').classList.add('pouring');
    };
    const end = () => {
      if (!st.pouring) return;
      st.pouring = false;
      cancelAnimationFrame(raf);
      if (stopSound) stopSound();
      btn.classList.remove('holding');
      const bowl = root.querySelector('.bowl-area');
      if (bowl) bowl.classList.remove('pouring');
      const m = st.milk;
      if (m < 0.35) MG.say(root, 'Keep pouring! Hold it a bit longer.');
      else if (m < 0.6) MG.say(root, 'Almost! A little more…');
      else if (m <= 0.88) {
        MG.say(root, 'Perfect pour! You’re a natural.', 'happy');
        BB.fx.sparkleAt(bowl, 10);
        next(900);
      } else {
        BB.S.stats.mistakes += 1;
        BB.audio.play('oops');
        MG.say(root, 'Whoa — milk tsunami! …Eh. Extra creamy. That’s a feature.', 'oops');
        st.milk = 0.9;
        next(1400);
      }
    };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointerleave', end);
    btn.addEventListener('pointercancel', end);
    btn.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e);
      else if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
    });
    btn.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') end();
    });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /* mixing: tap STIR or drag around the bowl */
  function stir(amount, el) {
    if (st.mix >= 1) return;
    st.mix = Math.min(1, st.mix + amount);
    BB.audio.play('stir');
    const spoon = root.querySelector('.spoon');
    if (spoon) {
      st.spoonA = (st.spoonA || 0) + (amount > 0.05 ? 60 : amount * 900);
      spoon.style.setProperty('--a', st.spoonA + 'deg');
    }
    if (el) BB.replay(el, 'press', 200);
    const bc = root.querySelector('.bowl-contents');
    if (bc) bc.innerHTML = bowlContents();
    const fill = root.querySelector('.mix-meter .fill');
    if (fill) fill.style.width = Math.round(st.mix * 100) + '%';
    const lab = root.querySelector('.mix-meter span');
    if (lab) lab.textContent = `Smoothness ${Math.round(st.mix * 100)}%`;
    if (st.mix >= 1) {
      MG.say(root, 'Silky smooth! Look at that shine!', 'happy');
      BB.fx.sparkleAt(root.querySelector('.bowl-area'), 14);
      next(900);
    } else if (Math.random() < 0.12) {
      MG.say(root, BB.pick(['Stir, stir, stir!', 'Great arm! Keep going!', 'Lumps, begone!', 'Faster! No — perfect. Keep going!']));
    }
  }

  function bindStirDrag(area) {
    if (!area) return;
    let lastA = null;
    area.addEventListener('pointerdown', (e) => {
      if (cur().id !== 'mix') return;
      area.setPointerCapture(e.pointerId);
      lastA = angle(e, area);
    });
    area.addEventListener('pointermove', (e) => {
      if (lastA == null || cur().id !== 'mix') return;
      const a = angle(e, area);
      let d = a - lastA;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      lastA = a;
      const amt = (Math.abs(d) / (Math.PI * 2)) * 0.34;
      if (amt > 0.004) stir(amt);
    });
    const up = () => (lastA = null);
    area.addEventListener('pointerup', up);
    area.addEventListener('pointercancel', up);
  }

  function angle(e, el) {
    const r = el.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height * 0.45), e.clientX - (r.left + r.width / 2));
  }

  function pourIntoTin() {
    const bowl = root.querySelector('.bowl-area');
    const tin = root.querySelector('.tin-wait');
    root.querySelector('[data-do="pourTin"]').disabled = true;
    BB.audio.play('plop');
    bowl.classList.add('tilt');
    tin.classList.add('filling');
    setTimeout(() => {
      tin.innerHTML = BB.art.tin(1, '#8b5a3c');
      BB.audio.play('plop');
    }, 700);
    MG.say(root, 'Scrape, scrape… every last drop! (I’ll lick the spoon later. Baker’s rules.)', 'happy');
    next(1500);
  }

  function tinToOven(btn) {
    if (st.lock || cur().id !== 'oven' || st.inOven) return;
    st.inOven = true;
    BB.audio.play('pop');
    btn.classList.add('into-oven');
    setTimeout(() => {
      BB.audio.play('door');
      updateWork(root.querySelector('.mg-work'), 'oven');
      MG.say(root, 'In it goes! Now turn the dial!');
    }, 500);
  }

  async function bake() {
    if (st.baking) return;
    const mySid = sid;
    st.baking = true;
    const work = root.querySelector('.mg-work');
    updateWork(work, 'oven');
    const dial = work.querySelector('.oven-dial');
    if (dial) dial.parentNode.classList.add('turned');
    BB.audio.play('click');
    const txt = work.querySelector('.baking-text');
    const timer = work.querySelector('.oven-timer-text');
    const chatter = ['It’s rising! Look!', 'Smells like a birthday already…', 'No peeking! …Okay, I peeked.', 'Almost there!'];
    for (let i = 5; i >= 1; i--) {
      if (!MG.alive(mySid)) return;
      txt.textContent = `Baking… ${i}…`;
      if (timer) timer.textContent = `00:0${i}`;
      BB.replay(txt, 'tick-pop', 400);
      BB.audio.play('tick');
      st.rise = (5 - i + 1) / 5;
      const inside = work.querySelector('.oven-inside');
      if (inside) inside.innerHTML = ovenCake(st.rise);
      if (i < 5) MG.say(root, chatter[5 - i - 1]);
      await BB.wait(BB.motionOK() ? 1000 : 700);
    }
    if (!MG.alive(mySid)) return;
    st.baking = false;
    txt.textContent = 'DING! 🔔';
    if (timer) timer.textContent = '00:00';
    BB.audio.play('ding');
    BB.replay(work.querySelector('.oven-btn'), 'wiggle', 600);
    S().step = 8;
    BB.game.changed(true);
    BB.store.save();
    render();
    MG.say(root, cur().say, 'happy');
  }

  function ovenClick() {
    const id = cur().id;
    if (id === 'takeout') return takeOut();
    if (id === 'oven' && !st.inOven) {
      MG.say(root, 'The oven’s ready! Tap the cake tin first to put it inside.');
      return;
    }
    if (st.baking) MG.say(root, BB.pick(['No peeking! …Okay, one peek. It’s rising!', 'Patience! Good things take five seconds.']));
  }

  function takeOut() {
    if (cur().id !== 'takeout') return;
    BB.audio.play('door');
    const work = root.querySelector('.mg-work');
    BB.replay(work.querySelector('.oven-btn'), 'press', 300);
    MG.say(root, 'Ooh, it’s perfect! Golden and fluffy. Now let’s decorate!', 'happy');
    BB.fx.sparkleAt(work.querySelector('.oven-btn'), 14);
    next(900);
  }

  function chooseFrosting(k, btn) {
    if (st.lock || cur().id !== 'frosting' || S().frosting) return;
    S().frosting = k;
    BB.audio.play('pop');
    BB.fx.sparkleAt(btn, 10);
    const lines = {
      chocolate: BB.S.flags.maxTip ? 'Chocolate! Max said it’s Lisa’s favourite. Good listening!' : 'Chocolate on chocolate? You’re a genius.',
      vanilla: 'Vanilla! Classic, fluffy, dreamy.',
      strawberry: 'Strawberry! Pink and pretty — so festive!',
    };
    MG.say(root, lines[k] + ' Now tap the cake to spread it!', 'happy');
    BB.store.save();
    render();
  }

  function cakeTap(btn) {
    if (st.lock) return;
    const id = cur().id;
    if (id === 'frosting' && S().frosting && st.frost < 3) {
      st.frost += 1;
      BB.audio.play('stir');
      BB.replay(btn, 'squish', 350);
      render();
      if (st.frost >= 3) {
        BB.fx.sparkleAt(btn, 14);
        MG.say(root, 'Silky swoops! A true frosting artist.', 'happy');
        next(900);
      } else MG.say(root, st.frost === 1 ? 'Swoosh! Keep spreading!' : 'One more swoop!');
    } else if (id === 'sprinkles') {
      shake(root.querySelector('[data-do="shake"]'));
    } else if (id === 'candles') {
      MG.say(root, 'Tap the candle numbers below!');
    }
  }

  function shake(btn) {
    if (st.lock) return;
    if (st.shakes >= 20) {
      MG.say(root, 'Okay — that’s MAXIMUM sprinkle. The cake is 40% sprinkles now.', 'oops');
      return;
    }
    st.shakes += 1;
    S().sprinkles = st.shakes;
    BB.audio.play('sprinkle');
    if (btn) BB.replay(btn, 'shake-y', 350);
    const rain = root.querySelector('.sprinkle-rain');
    if (rain && BB.motionOK()) {
      const colors = ['#ff6f91', '#ffd54f', '#4fc3f7', '#8bd35f', '#ff9a3c', '#b388ff'];
      for (let i = 0; i < 14; i++) {
        const sp = document.createElement('i');
        sp.style.left = BB.rand(28, 72) + '%';
        sp.style.background = BB.pick(colors);
        sp.style.animationDelay = BB.rand(0, 0.25) + 's';
        sp.style.transform = `rotate(${BB.randInt(0, 180)}deg)`;
        rain.appendChild(sp);
        setTimeout(() => sp.remove(), 1000);
      }
    }
    const mySid = sid;
    setTimeout(() => {
      if (!MG.alive(mySid)) return;
      updateWork(root.querySelector('.mg-work'), 'deco');
      if (st.shakes === 3) MG.say(root, 'Pretty! Keep going, or tap “Done sprinkling”.');
      if (st.shakes === 8) MG.say(root, 'LISA-LEVEL SPRINKLES! Max would approve.', 'happy');
      if (st.shakes === 14) MG.say(root, 'Is it a cake with sprinkles or sprinkles with a cake? Both! Both is good.', 'happy');
    }, BB.motionOK() ? 450 : 0);
  }

  function placeCandle(d, btn) {
    if (st.lock || cur().id !== 'candles' || st.candles.includes(d)) return;
    st.candles.push(d);
    BB.audio.play('pop');
    btn.disabled = true;
    render();
    if (st.candles.length < 2) {
      MG.say(root, d === '1' ? 'The 1! Now the 6.' : 'Ooh, the 6 first? Bold. Now the 1!');
      return;
    }
    const order = st.candles.join('');
    if (order === '61') {
      BB.S.stats.mistakes += 1;
      BB.audio.play('oops');
      MG.say(root, 'Lisa is turning… 61?! She’d be the oldest bunny in the burrow! Let me swap those.', 'oops');
      const mySid = sid;
      setTimeout(() => {
        if (!MG.alive(mySid)) return;
        st.candles = ['1', '6'];
        BB.audio.play('boing');
        render();
        MG.say(root, 'There — 16! Perfect.', 'happy');
      }, 1600);
      S().candles = '16';
      next(2600);
    } else {
      S().candles = '16';
      MG.say(root, 'Sixteen! It’s… it’s perfect.', 'happy');
      next(900);
    }
  }

  /* ---------- the big finish ---------- */
  function finish() {
    const c = S();
    c.done = true;
    c.candles = '16';
    if (!c.frosting) c.frosting = 'vanilla';
    BB.game.use(BB.CAKE_ITEMS);
    BB.store.save();
    MG.steps(root, STEPS.length, STEPS.length, 'Complete!');
    BB.$$('.ing', root).forEach((b) => b.classList.add('used'));
    const work = root.querySelector('.mg-work');
    work.dataset.view = 'done';
    work.innerHTML =
      `<div class="finish">` +
      `<div class="finish-poppy">${BB.art.bunny('poppy')}</div>` +
      `<div class="finish-cake">${BB.art.cake({ frosting: c.frosting, sprinkles: c.sprinkles, candles: '16', lit: true })}</div>` +
      `<h3>Cake complete! 🎂</h3>` +
      `<p>${c.frosting === 'chocolate' && c.sprinkles >= 8 ? 'Chocolate frosting AND Lisa-level sprinkles. Max’s intel paid off!' : 'A cake fit for a birthday bunny!'}</p>` +
      `<button class="btn btn-primary btn-big" data-finish>Back to the kitchen</button></div>`;
    MG.say(root, 'WE DID IT! It’s the most beautiful cake I’ve ever seen. I’m not crying. It’s the onions. There are no onions.', 'happy');
    BB.audio.play('fanfare');
    BB.fx.confetti({ count: 140 });
    const btn = work.querySelector('[data-finish]');
    btn.addEventListener('click', () => {
      BB.audio.play('click');
      MG.close();
    });
    btn.focus({ preventScroll: true });
    BB.game.changed();
  }
})(window.BB);
