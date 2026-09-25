/* Bunny Birthday Adventure — muffins.js
   Muffin mini-game: choose batter → fill six cups → chocolate chips → bake → decorate.
   Reward: carrots! */
(function (BB) {
  'use strict';

  const MG = BB.mg;
  const CUPS = ['#ffb3c7', '#fff0a0', '#bfe8d2', '#ffb3c7', '#fff0a0', '#bfe8d2'];
  const TOPS = [
    ['strawberry', 'Strawberry'],
    ['carrot', 'Icing carrot'],
    ['heart', 'Heart'],
    ['star', 'Star'],
    ['swirl', 'Swirl'],
  ];
  const STEPS = [
    { id: 'batter', say: 'Muffin time! First, which batter should we make?' },
    { id: 'fill', say: 'Fill all six muffin cups — tap each cup!' },
    { id: 'chips', say: 'Chocolate chips! Tap the bag to sprinkle them over the tray (3 times).' },
    { id: 'bake', say: 'Into the oven they go! Tap BAKE.' },
    { id: 'decorate', say: 'Decorate time! Pick a topping, then tap each muffin.' },
  ];
  const REWARD = 5;

  let root;
  let sid;
  let topping = 'strawberry';
  let lock = false;
  const M = () => BB.S.muffins;

  BB.muffins = {};

  BB.muffins.finalLooks = function () {
    const m = M();
    return CUPS.map((cup, i) => ({ state: 'baked', batter: m.batter || 'vanilla', chips: 3, topping: (m.toppings || [])[i] || 'heart', cup }));
  };

  function look(i) {
    const m = M();
    const filled = m.filled[i];
    return {
      state: m.step >= 4 ? 'baked' : filled ? 'filled' : 'cup',
      batter: m.batter || 'vanilla',
      chips: m.chips,
      topping: m.toppings[i],
      cup: CUPS[i],
    };
  }

  BB.muffins.open = function () {
    if (M().done) return;
    const r = MG.open(MG.shell('Party Muffins', '🧁', 'muffin-game'), { cls: 'mg-muffins' });
    root = r.root;
    sid = r.id;
    lock = false;
    const m = M();
    if (!Array.isArray(m.filled) || m.filled.length !== 6) m.filled = [false, false, false, false, false, false];
    if (!Array.isArray(m.toppings) || m.toppings.length !== 6) m.toppings = [null, null, null, null, null, null];
    root.querySelector('.mg-body').innerHTML =
      `<div class="muffin-stage"><div class="tray" role="group" aria-label="Muffin tray">${CUPS.map((_, i) => `<button class="muffin" data-i="${i}"></button>`).join('')}</div><div class="chip-rain" aria-hidden="true"></div></div>` +
      `<div class="mg-work muffin-work"><div class="work-actions"></div></div>`;
    root.querySelector('.mg-body').addEventListener('click', onClick);
    render();
    MG.say(root, m.step === 0 ? STEPS[0].say : 'Back for more muffins? Let’s finish them! ' + STEPS[m.step].say, 'happy');
  };

  function cur() {
    return STEPS[Math.min(M().step, STEPS.length - 1)];
  }

  function next(delay = 800) {
    lock = true;
    const mySid = sid;
    setTimeout(() => {
      if (!MG.alive(mySid)) return;
      lock = false;
      M().step += 1;
      BB.game.changed(true);
      BB.store.save();
      if (M().step >= STEPS.length) return finish();
      render();
      MG.say(root, cur().say);
    }, delay);
  }

  function render() {
    const m = M();
    MG.steps(root, m.step, STEPS.length);
    BB.$$('.muffin', root).forEach((b, i) => {
      b.innerHTML = BB.art.muffin(look(i));
      const id = cur().id;
      const tappable = (id === 'fill' && !m.filled[i]) || id === 'decorate';
      b.classList.toggle('tappable', tappable);
      b.setAttribute('aria-label', `Muffin ${i + 1}${m.filled[i] ? ', filled' : ', empty cup'}${m.toppings[i] ? ', topped with ' + m.toppings[i] : ''}`);
    });
    const act = root.querySelector('.work-actions');
    const id = cur().id;
    if (id === 'batter') {
      act.innerHTML =
        `<div class="choice-cards">` +
        [['vanilla', 'Vanilla', '#f3cf8e'], ['chocolate', 'Chocolate', '#8b5a3c'], ['carrot', 'Carrot', '#f0a35a']]
          .map(([k, n, c]) => `<button class="choice-card" data-batter="${k}"><span class="swatch" style="background:${c}"></span><b>${n}</b>${k === 'carrot' ? '<small>A bunny classic!</small>' : ''}</button>`)
          .join('') +
        `</div>`;
    } else if (id === 'fill') {
      act.innerHTML = `<p class="work-hint">Tap each empty cup to fill it! (${m.filled.filter(Boolean).length}/6)</p>`;
    } else if (id === 'chips') {
      act.innerHTML = `<button class="btn btn-primary btn-big" data-do="chips">${BB.art.icon('chips', 'btn-ico')} Sprinkle chips (${m.chips}/3)</button>`;
    } else if (id === 'bake') {
      act.innerHTML = `<button class="btn btn-primary btn-big" data-do="bake">🔥 BAKE!</button><div class="baking-text" aria-live="polite"></div>`;
    } else if (id === 'decorate') {
      const n = m.toppings.filter(Boolean).length;
      act.innerHTML =
        `<div class="topping-picks" role="group" aria-label="Toppings">${TOPS.map(([k, n2]) => `<button class="topping${k === topping ? ' on' : ''}" data-top="${k}" aria-pressed="${k === topping}"><span>${BB.art.muffin({ state: 'baked', batter: 'vanilla', topping: k, cup: 'transparent' }).replace('<svg', '<svg preserveAspectRatio="xMidYMin slice"')}</span><b>${n2}</b></button>`).join('')}</div>` +
        `<p class="work-hint">Decorated: <b>${n}/6</b> — tap a muffin to add the topping</p>`;
    }
  }

  function onClick(e) {
    if (lock) return;
    const m = M();
    const id = cur().id;
    const bat = e.target.closest('[data-batter]');
    if (bat && id === 'batter') {
      m.batter = bat.dataset.batter;
      BB.audio.play('pop');
      BB.fx.sparkleAt(bat, 10);
      MG.say(root, { vanilla: 'Vanilla! Soft and dreamy.', chocolate: 'Chocolate muffins with chocolate chips? Double chocolate! Lisa will LOVE it.', carrot: 'Carrot muffins! Very on-brand for a bunny party.' }[m.batter], 'happy');
      return next(900);
    }
    const mf = e.target.closest('.muffin');
    if (mf) {
      const i = +mf.dataset.i;
      if (id === 'fill') {
        if (m.filled[i]) {
          BB.audio.play('oops');
          MG.say(root, 'That one’s full! Any more and it’ll be a volcano muffin.', 'oops');
          BB.replay(mf, 'shake', 500);
          return;
        }
        m.filled[i] = true;
        BB.audio.play('plop');
        BB.replay(mf, 'squish', 350);
        render();
        const n = m.filled.filter(Boolean).length;
        if (n === 6) {
          MG.say(root, 'All six filled! Neat and tidy. Hazel would approve.', 'happy');
          next(700);
        } else if (n === 3) MG.say(root, 'Halfway there!');
        return;
      }
      if (id === 'decorate') {
        const had = m.toppings[i];
        m.toppings[i] = topping;
        BB.audio.play(had ? 'soft' : 'pop');
        BB.replay(mf, 'squish', 350);
        BB.fx.sparkleAt(mf, 6);
        render();
        const n = m.toppings.filter(Boolean).length;
        if (n === 6) {
          MG.say(root, 'Every muffin is a masterpiece!', 'happy');
          next(900);
        } else if (had) MG.say(root, 'Changed your mind? A designer’s prerogative!');
        return;
      }
      BB.audio.play('soft');
      MG.say(root, id === 'batter' ? 'Pick a batter first!' : id === 'chips' ? 'Tap the chips bag below!' : 'Tap BAKE below!');
      return;
    }
    const top = e.target.closest('[data-top]');
    if (top) {
      topping = top.dataset.top;
      BB.audio.play('click');
      render();
      return;
    }
    const d = e.target.closest('[data-do]');
    if (d && d.dataset.do === 'chips' && id === 'chips') chips(d);
    if (d && d.dataset.do === 'bake' && id === 'bake') bake(d);
  }

  function chips(btn) {
    const m = M();
    m.chips += 1;
    BB.audio.play('sprinkle');
    BB.replay(btn, 'shake-y', 350);
    const rain = root.querySelector('.chip-rain');
    if (rain && BB.motionOK()) {
      for (let i = 0; i < 16; i++) {
        const c = document.createElement('i');
        c.style.left = BB.rand(8, 92) + '%';
        c.style.animationDelay = BB.rand(0, 0.3) + 's';
        rain.appendChild(c);
        setTimeout(() => c.remove(), 1100);
      }
    }
    const mySid = sid;
    setTimeout(() => MG.alive(mySid) && render(), 350);
    if (m.chips >= 3) {
      MG.say(root, 'Chocolate chips everywhere! In a good way.', 'happy');
      next(900);
    } else MG.say(root, m.chips === 1 ? 'Ooh! More!' : 'One more shake!');
  }

  async function bake(btn) {
    const mySid = sid;
    lock = true;
    btn.disabled = true;
    BB.audio.play('door');
    const txt = root.querySelector('.baking-text');
    root.querySelector('.tray').classList.add('baking');
    for (let i = 3; i >= 1; i--) {
      if (!MG.alive(mySid)) return;
      txt.textContent = `Baking… ${i}…`;
      BB.replay(txt, 'tick-pop', 400);
      BB.audio.play('tick');
      await BB.wait(BB.motionOK() ? 900 : 600);
    }
    if (!MG.alive(mySid)) return;
    root.querySelector('.tray').classList.remove('baking');
    BB.audio.play('ding');
    txt.textContent = 'DING! 🔔';
    lock = false;
    MG.say(root, 'Look how they puffed up! Golden domes of joy!', 'happy');
    next(500);
    setTimeout(() => MG.alive(mySid) && BB.fx.sparkleAt(root.querySelector('.tray'), 18), 600);
  }

  function finish() {
    const m = M();
    m.done = true;
    BB.game.use(BB.MUFFIN_ITEMS);
    BB.store.save();
    MG.steps(root, STEPS.length, STEPS.length, 'Complete!');
    render();
    const act = root.querySelector('.work-actions');
    act.innerHTML =
      `<div class="finish small"><h3>6/6 muffins ready! 🧁</h3><p>Poppy gives you <b>${REWARD} carrots</b> for being an amazing baker.</p>` +
      `<button class="btn btn-primary btn-big" data-finish>Back to the kitchen</button></div>`;
    MG.say(root, 'SIX perfect muffins! Here — take some carrots. You earned them. (Hazel’s budget, shh.)', 'happy');
    BB.audio.play('fanfare');
    BB.fx.confetti({ count: 100 });
    if (!m.rewarded) {
      m.rewarded = true;
      BB.game.addCarrots(REWARD, act.querySelector('h3'));
    }
    const b = act.querySelector('[data-finish]');
    b.addEventListener('click', () => {
      BB.audio.play('click');
      MG.close();
    });
    b.focus({ preventScroll: true });
    BB.game.changed();
  }
})(window.BB);
