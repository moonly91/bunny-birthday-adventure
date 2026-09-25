/* Bunny Birthday Adventure — game.js
   Game rules: carrots, shopping, tasks & progress, hints, and where each bunny is. */
(function (BB) {
  'use strict';

  const G = (BB.game = {});
  const S = () => BB.S;

  /* ---------- inventory ---------- */
  G.owned = (id) => !!S().owned[id];
  G.has = (id) => !!S().owned[id] && !S().used[id];
  G.hasAll = (ids) => ids.every(G.owned);
  G.missing = (ids) => ids.filter((id) => !G.owned(id));
  G.costOf = (ids) => ids.reduce((sum, id) => sum + (BB.ITEMS[id].price || 0), 0);

  G.give = function (id) {
    S().owned[id] = true;
  };

  G.use = function (ids) {
    ids.forEach((id) => (S().used[id] = true));
  };

  /** Add (or remove, with n<0) carrots, with a floating label at srcEl. */
  G.addCarrots = function (n, srcEl, quiet) {
    S().carrots = Math.max(0, S().carrots + n);
    if (n > 0) S().stats.earned += n;
    else S().stats.spent += -n;
    const pill = document.getElementById('carrot-pill');
    if (srcEl && !quiet) {
      BB.fx.floatAt(srcEl, `${n > 0 ? '+' : ''}${n} 🥕`, n > 0 ? 'gain' : 'spend');
    }
    if (n > 0 && srcEl && pill) {
      BB.fx.fly(srcEl, pill, BB.art.carrotIcon('fly-carrot'), () => BB.ui.updateHUD());
    } else if (pill) {
      BB.replay(pill, n > 0 ? 'bump' : 'dip', 500);
    }
    G.changed();
  };

  /** Try to buy an item. Returns { ok, reason }. */
  G.buy = function (id, srcEl) {
    const item = BB.ITEMS[id];
    if (!item) return { ok: false, reason: 'unknown' };
    if (G.owned(id)) return { ok: false, reason: 'owned' };
    if (S().carrots < item.price) return { ok: false, reason: 'broke', need: item.price - S().carrots };
    G.give(id);
    G.addCarrots(-item.price, srcEl);
    BB.audio.play('buy');
    const bag = document.querySelector('[data-panel="inventory"]');
    if (srcEl && bag) BB.fx.fly(srcEl, bag, BB.art.icon(id));
    BB.fx.toast(`${BB.art.icon(id, 'toast-ico')}<span>You bought <b>${BB.esc(item.name.toLowerCase())}</b>!</span>`, { type: 'good' });
    G.checkGardenRefill();
    G.changed();
    return { ok: true };
  };

  /* ---------- economy safety net ---------- */
  /** Carrots still needed to buy everything the party requires. */
  G.requiredCost = function () {
    const need = BB.CAKE_ITEMS.concat(BB.MUFFIN_ITEMS, BB.DECOR_REQ).filter((id) => !G.owned(id));
    let cost = G.costOf(need);
    // decorating needs 5 pieces: table + chairs are free, balloons + banner required, so one more
    const extras = ['hats', 'confetti', 'bows', 'flowers', 'lights', 'gift'];
    if (!extras.some(G.owned)) cost += 2;
    return cost;
  };
  G.canFinishEconomy = () => S().carrots >= G.requiredCost();

  /** If the garden is empty and the player can't afford what's left, grow more carrots. */
  G.checkGardenRefill = function () {
    const g = S().garden;
    const allFound = BB.garden && BB.garden.remaining() === 0;
    if (allFound && !G.canFinishEconomy() && g.respawned < 5) {
      g.respawned += 1;
      g.found = g.found.filter((id) => !/^r\d/.test(id));
      BB.fx.toast('🌱 Fresh carrots sprouted in the garden!', { type: 'info' });
      return true;
    }
    return false;
  };

  /* ---------- conversations ---------- */
  G.flag = (k, v = true) => {
    S().flags[k] = v;
  };
  G.talked = (id) => {
    S().talked[id] = true;
  };
  G.talkedCount = () => BB.PARTY_BUNNIES.filter((id) => S().talked[id]).length;

  /* ---------- decorating ---------- */
  G.placedItems = () => Object.values(S().decor);
  G.decorCount = () => new Set(G.placedItems()).size;
  G.isPlaced = (item) => G.placedItems().includes(item);
  G.decorDone = () => G.isPlaced('balloons') && G.isPlaced('banner') && G.isPlaced('table') && G.decorCount() >= 5;

  /* ---------- tasks ---------- */
  BB.TASKS = [
    { id: 'plan', label: 'Get the party plan from Hazel', frac: () => (S().flags.plan ? 1 : 0) },
    {
      id: 'ingredients',
      label: 'Buy cake ingredients',
      frac: () => BB.CAKE_ITEMS.filter(G.owned).length / BB.CAKE_ITEMS.length,
      count: () => `${BB.CAKE_ITEMS.filter(G.owned).length}/${BB.CAKE_ITEMS.length}`,
    },
    { id: 'cake', label: 'Bake the birthday cake', frac: () => (S().cake.done ? 1 : S().cake.step / 12) },
    {
      id: 'carrots',
      label: 'Harvest carrots in the garden',
      frac: () => Math.min(1, G.gardenFound() / 10),
      count: () => `${Math.min(10, G.gardenFound())}/10`,
    },
    { id: 'muffins', label: 'Make muffins', frac: () => (S().muffins.done ? 1 : S().muffins.step / 5) },
    {
      id: 'decorations',
      label: 'Buy decorations',
      frac: () => BB.DECOR_REQ.filter(G.owned).length / BB.DECOR_REQ.length,
      count: () => `${BB.DECOR_REQ.filter(G.owned).length}/${BB.DECOR_REQ.length}`,
    },
    {
      id: 'decorate',
      label: 'Decorate the party room',
      frac: () => (G.decorDone() ? 1 : Math.min(0.9, G.decorCount() / 5)),
      count: () => `${Math.min(5, G.decorCount())}/5`,
    },
    {
      id: 'bunnies',
      label: 'Talk to the bunnies',
      frac: () => G.talkedCount() / BB.PARTY_BUNNIES.length,
      count: () => `${G.talkedCount()}/${BB.PARTY_BUNNIES.length}`,
    },
    {
      id: 'surprise',
      label: 'Prepare the surprise',
      frac: () => (S().surprise.done ? 1 : (Object.keys(S().surprise.hidden).length / 6) * 0.9),
    },
  ];

  /** Original garden carrots found (re-grown bonus carrots don't count toward the task). */
  G.gardenFound = () => S().garden.found.filter((id) => !/^r\d/.test(id)).length;

  G.taskDone = (id) => !!S().tasks[id];

  G.progress = function () {
    const sum = BB.TASKS.reduce((acc, t) => acc + (G.taskDone(t.id) ? 1 : BB.clamp(t.frac(), 0, 1)), 0);
    return Math.round((sum / BB.TASKS.length) * 100);
  };

  G.readyForSurprise = () => BB.TASKS.every((t) => t.id === 'surprise' || G.taskDone(t.id));

  /** Re-evaluate task completion. Newly completed tasks celebrate unless silent. */
  G.refreshTasks = function (silent) {
    const s = S();
    const newly = [];
    BB.TASKS.forEach((t) => {
      if (s.tasks[t.id]) return;
      let done = false;
      switch (t.id) {
        case 'plan': done = !!s.flags.plan; break;
        case 'ingredients': done = G.hasAll(BB.CAKE_ITEMS); break;
        case 'cake': done = s.cake.done; break;
        case 'carrots': done = G.gardenFound() >= 10; break;
        case 'muffins': done = s.muffins.done; break;
        case 'decorations': done = G.hasAll(BB.DECOR_REQ); break;
        case 'decorate': done = G.decorDone(); break;
        case 'bunnies': done = G.talkedCount() >= BB.PARTY_BUNNIES.length; break;
        case 'surprise': done = s.surprise.done; break;
      }
      if (done) {
        s.tasks[t.id] = true;
        newly.push(t);
      }
    });
    if (!silent) {
      newly.forEach((t, i) => setTimeout(() => BB.ui.celebrateTask(t), 350 + i * 900));
      if (newly.length && G.readyForSurprise() && !s.flags.readyAnnounced) {
        s.flags.readyAnnounced = true;
        setTimeout(() => {
          BB.fx.toast('🎉 Everything is ready! Find <b>Max</b> in the <b>Party Room</b> to start the surprise.', { type: 'big', dur: 5000 });
          BB.fx.confetti({ count: 80 });
          if (BB.scenes) BB.scenes.refresh();
        }, 400 + newly.length * 900);
      }
    }
    return newly;
  };

  /** Call after any state change: re-checks tasks, refreshes the HUD and saves. */
  G.changed = function (silent) {
    G.refreshTasks(silent);
    if (BB.ui) BB.ui.updateHUD();
    if (BB.scenes && BB.scenes.softRefresh) BB.scenes.softRefresh();
    BB.store.saveSoon();
    BB.emit('changed');
  };

  /* ---------- where is everyone? ---------- */
  G.where = function (id) {
    const s = S();
    if (id === 'shop') return 'shop';
    if (id === 'lisa') return s.finished ? 'party' : null;
    if (s.finished || G.readyForSurprise()) return 'party';
    switch (id) {
      case 'hazel': return s.cake.done ? 'party' : 'kitchen';
      case 'poppy': return 'kitchen';
      case 'coco': return 'party';
      case 'milo': return G.taskDone('decorate') ? 'party' : 'garden';
      case 'bun': return 'garden';
      case 'max': return 'garden';
    }
    return null;
  };
  G.bunniesAt = (loc) => BB.PARTY_BUNNIES.concat(['shop', 'lisa']).filter((id) => G.where(id) === loc && !(id === 'bun' && !S().flags.bunFound && loc === 'garden'));

  /* ---------- the "what next?" hint ---------- */
  G.hint = function () {
    const s = S();
    const broke = (ids) => G.costOf(G.missing(ids)) > s.carrots;
    if (s.finished) return { text: 'The party was a hit! Enjoy the celebration 🎉', loc: 'party' };
    if (!s.flags.plan) return { text: 'Talk to Hazel in the Kitchen', loc: 'kitchen' };
    if (G.readyForSurprise()) {
      return s.surprise.hiding
        ? { text: 'Tap each bunny to send them to a hiding spot!', loc: 'party' }
        : { text: 'Everything is ready! Talk to Max in the Party Room', loc: 'party' };
    }
    if (!G.taskDone('ingredients')) {
      if (!s.talked.poppy) return { text: 'Ask Poppy what the cake needs', loc: 'kitchen' };
      if (broke(BB.CAKE_ITEMS)) return { text: 'Need more carrots — search the Garden!', loc: 'garden' };
      return { text: `Buy cake ingredients at the Carrot Market (${BB.CAKE_ITEMS.filter(G.owned).length}/7)`, loc: 'shop' };
    }
    if (!s.cake.done) return { text: 'Bake the cake — tap the mixing bowl in the Kitchen', loc: 'kitchen' };
    if (!s.muffins.done) {
      if (!G.hasAll(BB.MUFFIN_ITEMS)) {
        return broke(BB.MUFFIN_ITEMS)
          ? { text: 'Need more carrots — search the Garden!', loc: 'garden' }
          : { text: 'Buy muffin cups & chocolate chips at the Shop', loc: 'shop' };
      }
      return { text: 'Make muffins — tap the muffin tray in the Kitchen', loc: 'kitchen' };
    }
    if (!G.taskDone('decorations')) {
      return broke(BB.DECOR_REQ)
        ? { text: 'Need more carrots — search the Garden!', loc: 'garden' }
        : { text: 'Buy balloons and a birthday banner at the Shop', loc: 'shop' };
    }
    if (!G.taskDone('decorate')) {
      if (!s.talked.coco) return { text: 'Talk to Coco in the Party Room', loc: 'party' };
      const placeable = Object.keys(s.owned).filter((id) => BB.ITEMS[id].decor && !G.isPlaced(id));
      if (G.decorCount() < 5 && !placeable.length) {
        return s.carrots >= 2
          ? { text: 'Buy one more decoration at the Shop', loc: 'shop' }
          : { text: 'Find carrots in the Garden for one more decoration', loc: 'garden' };
      }
      return { text: `Decorate the Party Room with Coco (${Math.min(5, G.decorCount())}/5)`, loc: 'party' };
    }
    if (!G.taskDone('carrots')) return { text: `Harvest carrots in the Garden (${Math.min(10, G.gardenFound())}/10)`, loc: 'garden' };
    if (!G.taskDone('bunnies')) {
      const miss = BB.PARTY_BUNNIES.filter((id) => !s.talked[id]);
      if (miss.includes('bun') && !s.flags.bunFound) return { text: 'Someone is hiding in a garden bush… find them!', loc: 'garden' };
      const first = miss[0];
      return { text: `Say hi to ${miss.map((id) => BB.CHARS[id].name).join(', ')}`, loc: G.where(first) || 'garden' };
    }
    return { text: 'Check your to-do list!', loc: s.location };
  };
})(window.BB);
