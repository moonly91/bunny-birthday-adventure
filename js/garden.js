/* Bunny Birthday Adventure — garden.js
   The Garden: a carrot hunt (some carrots hide in bushes and one is up a tree),
   plus Milo, Max, and Bun hiding somewhere. */
(function (BB) {
  'use strict';

  const CARROTS = [
    { id: 'p1', l: 30, b: 11 },
    { id: 'p2', l: 40, b: 12 },
    { id: 'p3', l: 50, b: 11 },
    { id: 'p4', l: 34.5, b: 3.5 },
    { id: 'p5', l: 45, b: 4 },
    { id: 'p6', l: 55, b: 3.5 },
    { id: 'g1', l: 20, b: 18, grass: true },
    { id: 'g2', l: 66, b: 21, grass: true },
    { id: 'bA', bush: 'A' },
    { id: 'bC', bush: 'C' },
    { id: 'bE', bush: 'E' },
    { id: 't1', tree: true },
  ];
  const REGROW = [
    { id: 'r1', l: 30, b: 11 },
    { id: 'r2', l: 45, b: 12 },
    { id: 'r3', l: 60, b: 9 },
    { id: 'r4', l: 38, b: 3.5 },
    { id: 'r5', l: 52, b: 3.5 },
  ];
  const BUSHES = [
    { id: 'A', l: 22, b: 34, w: 20, v: 0, has: 'carrot' },
    { id: 'B', l: 37, b: 40, w: 19, v: 1, has: 'bun' },
    { id: 'C', l: 69, b: 40, w: 19, v: 2, has: 'carrot' },
    { id: 'D', l: 17, b: 3, w: 16, v: 1, has: 'butterfly' },
    { id: 'E', l: -1.5, b: -1, w: 28, v: 0, has: 'carrot' },
  ];
  const TOTAL = CARROTS.length;

  const found = (id) => BB.S.garden.found.includes(id);
  const regrowActive = () => BB.S.garden.respawned > 0;

  BB.garden = {
    total: TOTAL,
    remaining() {
      let n = CARROTS.filter((c) => !found(c.id)).length;
      if (regrowActive()) n += REGROW.filter((c) => !found(c.id)).length;
      return n;
    },
  };

  const sproutBtn = (c) =>
    BB.propHTML({
      act: 'carrot', id: c.id, l: c.l, b: c.b, w: 9, h: 10, z: 14, cls: 'carrot-sprout' + (c.grass ? ' in-grass' : ''),
      label: 'Pull up a carrot', html: BB.art.carrotSprout(),
    });

  BB.SCENES.garden = {
    render() {
      const g = BB.S.garden;
      let h = `<div class="bg">${BB.art.gardenBg('g')}</div>`;
      // drifting clouds & butterflies
      h += BB.decoHTML({ l: 8, t: 6, w: 24, cls: 'cloud c1', html: BB.art.cloud() });
      h += BB.decoHTML({ l: 48, t: 12, w: 18, cls: 'cloud c2', html: BB.art.cloud() });
      h += BB.decoHTML({ l: 70, t: 3, w: 14, cls: 'cloud c3', html: BB.art.cloud() });
      h += BB.decoHTML({ l: 60, b: 48, w: 5, z: 30, cls: 'butterfly b1', html: BB.art.butterfly('#ff8fab') });
      h += BB.decoHTML({ l: 30, b: 55, w: 4, z: 30, cls: 'butterfly b2', html: BB.art.butterfly('#ffd54f') });

      // the tree (one carrot is stuck up there…)
      h += BB.propHTML({
        act: 'tree', l: -2, b: 20, w: 44, h: 64, z: 6, cls: 'tree' + (g.tree ? ' shaken' : ''),
        label: g.tree ? 'The tree' : 'The tree — something orange is up there…', html: BB.art.tree(),
      });
      // bench for Max
      h += BB.decoHTML({ l: 52, b: 39, w: 26, h: 13, z: 7, html: BB.art.bench() });

      // bushes
      BUSHES.forEach((bu) => {
        const bunHere = bu.has === 'bun' && !BB.S.flags.bunFound;
        h += BB.propHTML({
          act: 'bush', id: bu.id, l: bu.l, b: bu.b, w: bu.w, h: (bu.w * 150) / 220, z: bu.id === 'E' ? 40 : 10,
          cls: 'bush' + (bunHere ? ' has-bun' : ''),
          label: 'A leafy bush — search it',
          html: (bunHere ? `<span class="peek-ears" aria-hidden="true"><i></i><i></i></span>` : '') + BB.art.bush(bu.v),
        });
      });

      // soil patch with carrots
      h += BB.decoHTML({ l: 26, b: 2, w: 66, h: 19, z: 3, cls: 'soil-patch', html: '<div></div>' });
      CARROTS.filter((c) => c.l != null && !found(c.id)).forEach((c) => {
        h += sproutBtn(c);
        if (c.grass) h += BB.decoHTML({ l: c.l - 1.5, b: c.b - 1.5, w: 13, h: 8, z: 15, cls: 'grass-tuft', html: BB.art.grassTuft() });
      });
      if (regrowActive()) REGROW.filter((c) => !found(c.id)).forEach((c) => (h += sproutBtn(c)));

      // bunnies
      if (BB.game.where('max') === 'garden') h += BB.actorHTML('max', { l: 55, b: 38, h: 34, z: 8 });
      if (BB.game.where('milo') === 'garden') h += BB.actorHTML('milo', { l: 79, b: 2, h: 46, z: 30 });
      if (BB.game.where('bun') === 'garden' && BB.S.flags.bunFound) h += BB.actorHTML('bun', { l: 40, b: 26, h: 30, z: 12 });
      return h;
    },
    renderUI() {
      const n = TOTAL - CARROTS.filter((c) => !found(c.id)).length;
      return `<div class="chip garden-chip" id="garden-chip">${BB.art.carrotIcon()}<span>Found <b>${n}</b>/${TOTAL}</span></div>`;
    },
    onAction(act, el) {
      if (act === 'carrot') collect(el.dataset.id, el);
      else if (act === 'bush') searchBush(el.dataset.id, el);
      else if (act === 'tree') shakeTree(el);
    },
    entered() {
      if (!BB.S.flags.gardenTip) {
        BB.S.flags.gardenTip = true;
        BB.fx.toast('🥕 Tip: tap carrot tops to pull them up. Some carrots are hidden in bushes!', { dur: 4200 });
      }
    },
  };

  function updateChip() {
    const chip = document.getElementById('garden-chip');
    if (!chip) return;
    const n = TOTAL - CARROTS.filter((c) => !found(c.id)).length;
    chip.querySelector('b').textContent = n;
    BB.replay(chip, 'bump', 500);
  }

  function gain(id, fromEl) {
    if (found(id)) return;
    BB.S.garden.found.push(id);
    BB.audio.play('carrot');
    BB.fx.sparkleAt(fromEl, 8);
    BB.game.addCarrots(1, fromEl);
    updateChip();
    if (BB.garden.remaining() === 0) {
      if (!BB.S.flags.allCarrots) {
        BB.S.flags.allCarrots = true;
        setTimeout(() => {
          BB.fx.toast('🌟 You found every carrot in the garden!', { type: 'good' });
          BB.fx.confetti({ count: 50 });
        }, 500);
      }
      if (BB.game.checkGardenRefill()) setTimeout(() => BB.scenes.refresh(), 1400);
    }
  }

  function collect(id, el) {
    if (found(id) || el.classList.contains('pulled')) return;
    el.classList.add('pulled');
    el.disabled = true;
    BB.audio.play('pop');
    setTimeout(() => {
      gain(id, el);
      setTimeout(() => el.remove(), 450);
    }, BB.motionOK() ? 280 : 0);
  }

  /** A carrot pops out of a bush or tree and gets collected. */
  function popCarrot(id, el, fromTop) {
    const pop = document.createElement('div');
    pop.className = 'popped-carrot' + (fromTop ? ' falls' : '');
    pop.innerHTML = BB.art.carrotIcon();
    el.appendChild(pop);
    setTimeout(() => {
      gain(id, pop);
      setTimeout(() => pop.remove(), 300);
    }, BB.motionOK() ? 650 : 50);
  }

  function searchBush(id, el) {
    const bu = BUSHES.find((b) => b.id === id);
    BB.audio.play('rustle');
    BB.replay(el, 'rustle', 600);
    const searched = BB.S.garden.bushes.includes(id);
    if (!searched) BB.S.garden.bushes.push(id);
    const milo = document.querySelector('[data-actor="milo"]');

    if (bu.has === 'carrot') {
      const cid = 'b' + id;
      if (!found(cid)) popCarrot(cid, el);
      else BB.fx.bark(el, BB.pick(['Just leaves. Very nice leaves though.', 'Empty! You already found this one.', 'Nothing but a ladybug. 🐞']));
    } else if (bu.has === 'bun') {
      if (!BB.S.flags.bunFound) {
        BB.S.flags.bunFound = true;
        BB.audio.play('boing');
        BB.fx.sparkleAt(el, 12, { shapes: ['✦', '♥', '★'] });
        BB.game.changed();
        BB.scenes.refresh();
        setTimeout(() => {
          const bun = document.querySelector('[data-actor="bun"]');
          if (bun) BB.replay(bun, 'pop-in', 600);
          BB.talk('bun');
        }, 250);
      } else {
        BB.fx.bark(el, 'Only a few carrot crumbs left. Bun was definitely here.');
      }
    } else if (bu.has === 'butterfly') {
      if (!searched) {
        const b = document.createElement('div');
        b.className = 'escape-butterfly';
        b.innerHTML = BB.art.butterfly('#9ad8ff');
        el.appendChild(b);
        setTimeout(() => b.remove(), 2200);
        BB.fx.bark(el, 'A very surprised butterfly!');
      } else {
        BB.fx.bark(el, 'Just leaves. The butterfly moved out.');
      }
      if (milo && !searched) setTimeout(() => BB.fx.bark(milo, 'Not that one! …I think.'), 900);
    }
    BB.store.saveSoon();
  }

  function shakeTree(el) {
    BB.audio.play('rustle');
    BB.replay(el, 'tree-shake', 800);
    if (!BB.S.garden.tree) {
      BB.S.garden.tree = true;
      el.classList.add('shaken');
      setTimeout(() => {
        BB.audio.play('boing');
        popCarrot('t1', el, true);
        const milo = document.querySelector('[data-actor="milo"]');
        if (milo) setTimeout(() => BB.fx.bark(milo, 'I have NO idea how that got up there.'), 700);
      }, 350);
    } else {
      BB.fx.bark(el, 'Just leaves up there now… and one very confused bird.');
    }
  }
})(window.BB);
