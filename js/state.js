/* Bunny Birthday Adventure — state.js
   The single central game state (BB.S) and its localStorage persistence. */
(function (BB) {
  'use strict';

  const KEY = 'bunnyBirthdayAdventure.save.v1';

  function defaults() {
    return {
      v: 1,
      started: false,
      location: 'kitchen',
      carrots: 30,
      owned: {}, // itemId -> true once bought/received
      used: {}, // itemId -> true once consumed by a recipe
      tasks: {}, // taskId -> true (sticky once completed)
      flags: {}, // story flags set by dialogue
      talked: {}, // charId -> true
      convos: {}, // conversationId -> times completed
      seen: {}, // "convo:node" -> true, for fast-forwarding seen lines
      garden: { found: [], bushes: [], tree: false, respawned: 0 },
      cake: { step: 0, done: false, frosting: null, sprinkles: 0, candles: null },
      muffins: { step: 0, done: false, batter: null, filled: [], chips: 0, toppings: [] },
      decor: {}, // slotId -> itemId
      surprise: { gift: null, hiding: false, hidden: {}, done: false },
      finished: false,
      stats: { earned: 0, spent: 0, playMs: 0, mistakes: 0 },
      settings: { sound: true, music: true, motion: 'auto', text: 'normal' },
    };
  }

  function isObj(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  /** Deep-merge a saved game over fresh defaults so older saves still load. */
  function merge(base, saved) {
    if (!isObj(saved)) return base;
    Object.keys(saved).forEach((k) => {
      if (isObj(base[k]) && isObj(saved[k])) base[k] = merge(base[k], saved[k]);
      else if (saved[k] !== undefined) base[k] = saved[k];
    });
    return base;
  }

  BB.newState = defaults;
  BB.S = defaults();

  let timer = null;
  BB.store = {
    KEY,
    hasSave() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return false;
        const d = JSON.parse(raw);
        return !!(d && d.started);
      } catch (e) {
        return false;
      }
    },
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          BB.S = merge(defaults(), JSON.parse(raw));
          return true;
        }
      } catch (e) {
        /* corrupted or blocked storage: start fresh */
      }
      return false;
    },
    save() {
      clearTimeout(timer);
      timer = null;
      try {
        localStorage.setItem(KEY, JSON.stringify(BB.S));
      } catch (e) {
        /* storage full or disabled — the game still plays */
      }
    },
    saveSoon() {
      clearTimeout(timer);
      timer = setTimeout(() => BB.store.save(), 200);
    },
    /** Wipe progress but keep the player's settings. */
    reset() {
      const settings = Object.assign({}, BB.S.settings);
      BB.S = defaults();
      BB.S.settings = settings;
      BB.store.save();
    },
  };

  window.addEventListener('beforeunload', () => {
    if (timer) BB.store.save();
  });
})(window.BB);
