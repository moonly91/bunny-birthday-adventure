/* Bunny Birthday Adventure — ui.js
   HUD (carrots, progress), objective hint, TO-DO / INVENTORY / MAP panels,
   settings & confirm modals, and task-complete celebrations. */
(function (BB) {
  'use strict';

  const UI = (BB.ui = {});
  const $ = BB.$;
  let openPanelName = null;
  let lastFocus = null;
  let shownPct = null;

  UI.init = function () {
    $('#carrot-icon').innerHTML = BB.art.carrotIcon();

    BB.$$('.dock-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        BB.audio.play('click');
        UI.togglePanel(btn.dataset.panel);
      });
    });
    $('#panel-close').addEventListener('click', () => UI.closePanel());
    $('#panel-scrim').addEventListener('click', () => UI.closePanel());
    $('#panel-body').addEventListener('click', onPanelClick);

    $('#objective').addEventListener('click', () => {
      BB.audio.play('click');
      const h = BB.game.hint();
      if (h.loc && h.loc !== BB.S.location && BB.S.started) BB.scenes.go(h.loc);
      else UI.openPanel('todo');
    });

    $('#btn-settings').addEventListener('click', () => {
      BB.audio.play('click');
      UI.openSettings();
    });
    $('#btn-sound').addEventListener('click', () => {
      BB.S.settings.sound = !BB.S.settings.sound;
      BB.audio.init();
      BB.audio.syncMusic();
      BB.audio.play('click');
      UI.syncToggles();
      BB.store.saveSoon();
    });
    $('#btn-music').addEventListener('click', () => {
      BB.S.settings.music = !BB.S.settings.music;
      BB.audio.init();
      BB.audio.syncMusic();
      BB.audio.play('click');
      UI.syncToggles();
      BB.store.saveSoon();
    });

    document.addEventListener('keydown', onKey);
    UI.syncToggles();
  };

  function onKey(e) {
    if (e.key === 'Escape') {
      if (document.querySelector('.modal-wrap')) return; // modals handle their own Esc
      if (openPanelName) {
        UI.closePanel();
        e.preventDefault();
      }
      return;
    }
    const gameVisible = $('#game').classList.contains('is-active');
    const typing = /INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '');
    if (!gameVisible || typing || e.ctrlKey || e.metaKey || e.altKey) return;
    if (BB.dialogue && BB.dialogue.isOpen()) return;
    if (document.querySelector('.modal-wrap')) return;
    const k = e.key.toLowerCase();
    if (k === 't') UI.togglePanel('todo');
    else if (k === 'i') UI.togglePanel('inventory');
    else if (k === 'm') UI.togglePanel('map');
    else if (/^[1-4]$/.test(k) && !BB.minigameOpen) {
      UI.closePanel();
      BB.scenes.go(BB.LOC_ORDER[+k - 1]);
    }
  }

  UI.syncToggles = function () {
    const s = BB.S.settings;
    const snd = $('#btn-sound');
    snd.textContent = s.sound ? '🔊' : '🔇';
    snd.setAttribute('aria-pressed', String(s.sound));
    snd.title = s.sound ? 'Sound on' : 'Sound off';
    const mus = $('#btn-music');
    mus.classList.toggle('off', !s.music || !s.sound);
    mus.setAttribute('aria-pressed', String(s.music));
    mus.title = s.music ? 'Music on' : 'Music off';
    UI.applyMotion();
  };

  UI.applyMotion = function () {
    const m = BB.S.settings.motion;
    const osReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reduce = m === 'reduce' || (m === 'auto' && osReduce);
    document.documentElement.classList.toggle('reduce-motion', reduce);
  };

  /* ================= HUD ================= */
  UI.updateHUD = function () {
    const s = BB.S;
    const cc = $('#carrot-count');
    if (cc.textContent !== String(s.carrots)) {
      cc.textContent = s.carrots;
    }
    const pct = BB.game.progress();
    $('#progress-fill').style.width = pct + '%';
    $('#progress-pct').textContent = pct + '%';
    const bar = $('#hud-progress');
    bar.setAttribute('aria-valuenow', pct);
    bar.classList.toggle('complete', pct >= 100);
    if (shownPct !== null && pct > shownPct) BB.replay($('#progress-fill'), 'shine', 900);
    shownPct = pct;

    const h = BB.game.hint();
    const loc = BB.LOCATIONS[h.loc];
    const away = h.loc && h.loc !== s.location && !s.finished;
    $('#objective-text').textContent = h.text;
    $('#objective-go').textContent = away && loc ? `Go ${loc.icon}` : '☑ List';
    $('#objective').setAttribute('aria-label', `Next goal: ${h.text}. ${away && loc ? 'Click to travel to the ' + loc.name : 'Click to open the to-do list'}`);

    const left = BB.TASKS.filter((t) => !BB.game.taskDone(t.id)).length;
    const badge = $('#todo-badge');
    badge.textContent = left;
    badge.hidden = left === 0;

    const L = BB.LOCATIONS[s.location];
    $('#loc-badge').innerHTML = `<span aria-hidden="true">${L.icon}</span> ${L.name}`;
    BB.$$('.dock-btn').forEach((b) => b.setAttribute('aria-expanded', String(openPanelName === b.dataset.panel)));

    if (openPanelName) renderPanel(openPanelName, true);
  };

  UI.bumpCarrots = () => BB.replay($('#carrot-pill'), 'bump', 500);

  /* ================= PANELS ================= */
  UI.togglePanel = (name) => (openPanelName === name ? UI.closePanel() : UI.openPanel(name));

  UI.openPanel = function (name) {
    if (!openPanelName) lastFocus = document.activeElement;
    openPanelName = name;
    const panel = $('#panel');
    panel.hidden = false;
    $('#panel-scrim').hidden = false;
    panel.dataset.kind = name;
    renderPanel(name);
    requestAnimationFrame(() => panel.classList.add('open'));
    BB.audio.play('open');
    UI.updateHUD();
    setTimeout(() => {
      const f = panel.querySelector('.panel-body button, #panel-close');
      if (f) f.focus({ preventScroll: true });
    }, 60);
  };

  UI.closePanel = function () {
    if (!openPanelName) return;
    openPanelName = null;
    const panel = $('#panel');
    panel.classList.remove('open');
    $('#panel-scrim').hidden = true;
    setTimeout(() => {
      if (!openPanelName) panel.hidden = true;
    }, 260);
    BB.audio.play('close');
    UI.updateHUD();
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  };

  UI.isPanelOpen = () => !!openPanelName;

  function renderPanel(name, isUpdate) {
    const titles = { todo: '🎂 Birthday To-Do', inventory: '🎒 Inventory', map: '📍 Locations' };
    $('#panel-title').textContent = titles[name];
    const body = $('#panel-body');
    const scroll = body.scrollTop;
    body.innerHTML = name === 'todo' ? todoHTML() : name === 'inventory' ? inventoryHTML() : mapHTML();
    if (isUpdate) body.scrollTop = scroll;
  }

  function todoHTML() {
    const s = BB.S;
    const pct = BB.game.progress();
    const allDone = BB.TASKS.every((t) => BB.game.taskDone(t.id));
    const ready = BB.game.readyForSurprise();
    const items = BB.TASKS.map((t) => {
      const done = BB.game.taskDone(t.id);
      const count = !done && t.count ? `<span class="task-count">${t.count()}</span>` : '';
      return `<li class="task ${done ? 'done' : ''}" data-task="${t.id}"><span class="check" aria-hidden="true">${done ? '✓' : ''}</span><span class="task-label">${t.label}</span>${count}<span class="sr-only">${done ? ' (done)' : ' (not done yet)'}</span></li>`;
    }).join('');
    const h = BB.game.hint();
    return (
      `<div class="todo-head"><div class="todo-date"><span>SEPT</span><b>26</b></div><div><div class="todo-sub">Lisa's 16th Birthday</div>` +
      `<div class="mini-bar" aria-hidden="true"><div style="width:${pct}%"></div></div><div class="todo-pct">Party preparation: <b>${pct}%</b></div></div></div>` +
      (allDone || s.finished
        ? `<div class="party-ready">🎉 PARTY READY! 🎉</div>`
        : ready
          ? `<div class="party-ready soon">🎉 PARTY READY — time for the surprise!</div>`
          : '') +
      `<ul class="task-list">${items}</ul>` +
      `<div class="hazel-note"><div class="mini-portrait">${BB.art.bunny('hazel', { portrait: true })}</div><p><b>Hazel:</b> ${hazelNote(h)}</p></div>`
    );
  }

  function hazelNote(h) {
    if (BB.S.finished) return 'Every box is ticked. I am framing this list.';
    if (BB.game.readyForSurprise()) return 'Everything is ready. EVERYTHING. Go find Max!';
    const lines = ['Panic? Completely unnecessary.', 'One box at a time. Like a professional.', 'I colour-coded this. You’re welcome.'];
    return `Next: <i>${BB.esc(h.text)}</i>. ${lines[BB.game.progress() % 3]}`;
  }

  function itemStatus(id) {
    const it = BB.ITEMS[id];
    if (BB.S.used[id]) return { txt: it.use === 'cake' ? 'Used in the cake ✓' : 'Used in muffins ✓', cls: 'used' };
    if (it.decor) return BB.game.isPlaced(id) ? { txt: 'Placed in party room ✓', cls: 'used' } : { txt: 'Decoration — place it in the Party Room', cls: '' };
    if (it.use === 'cake') return { txt: 'For the birthday cake', cls: '' };
    if (it.use === 'muffins') return { txt: 'For the muffins', cls: '' };
    return { txt: '', cls: '' };
  }

  function inventoryHTML() {
    const s = BB.S;
    const ids = Object.keys(BB.ITEMS).filter((id) => s.owned[id]);
    const special = [];
    if (s.cake.done) special.push(`<li class="inv-item special">${BB.art.icon('cake')}<div><b>Lisa's Birthday Cake</b><small>${s.cake.frosting ? s.cake.frosting[0].toUpperCase() + s.cake.frosting.slice(1) + ' frosting · ' : ''}ready for the party!</small></div></li>`);
    if (s.muffins.done) special.push(`<li class="inv-item special">${BB.art.icon('muffin')}<div><b>6 Muffins</b><small>Fresh from the oven</small></div></li>`);
    const list = ids.map((id) => {
      const st = itemStatus(id);
      return `<li class="inv-item ${st.cls}">${BB.art.icon(id)}<div><b>${BB.ITEMS[id].name}</b><small>${st.txt}</small></div></li>`;
    }).join('');
    return (
      `<div class="inv-carrots">${BB.art.carrotIcon()}<div><b>${s.carrots} carrots</b><small>Spend them at the Carrot Market 🛍️</small></div></div>` +
      (special.length ? `<h3 class="inv-h">Made with love</h3><ul class="inv-grid">${special.join('')}</ul>` : '') +
      `<h3 class="inv-h">Your bag</h3>` +
      (ids.length
        ? `<ul class="inv-grid">${list}</ul>`
        : `<p class="empty">Your bag is empty! The <b>Carrot Market</b> sells ingredients and decorations.</p>`)
    );
  }

  function mapHTML() {
    const cur = BB.S.location;
    const cards = BB.LOC_ORDER.map((id, i) => {
      const L = BB.LOCATIONS[id];
      const who = BB.game.bunniesAt(id).map((c) => `<span class="map-face" title="${BB.CHARS[c].name}">${BB.art.bunny(c, { portrait: true })}</span>`).join('');
      const here = id === cur;
      return (
        `<button class="map-card loc-${id} ${here ? 'here' : ''}" data-go="${id}" aria-label="Travel to the ${L.name}${here ? ' (you are here)' : ''}. Shortcut key ${i + 1}.">` +
        `<span class="map-icon" aria-hidden="true">${L.icon}</span><span class="map-name">${L.name}</span><span class="map-blurb">${L.blurb}</span>` +
        `<span class="map-who">${who}</span>${here ? '<span class="here-pin">📍 You are here</span>' : ''}<kbd aria-hidden="true">${i + 1}</kbd></button>`
      );
    }).join('');
    return `<p class="map-tip">Tap a place to teleport there instantly.</p><div class="map-grid">${cards}</div>`;
  }

  function onPanelClick(e) {
    const go = e.target.closest('[data-go]');
    if (go) {
      BB.audio.play('click');
      UI.closePanel();
      BB.scenes.go(go.dataset.go);
    }
  }

  /* ================= TASK CELEBRATION ================= */
  UI.celebrateTask = function (task) {
    BB.audio.play('task');
    BB.fx.toast(`<span class="toast-check">✓</span><span><small>Task complete!</small><b>${BB.esc(task.label)}</b></span>`, { type: 'task', dur: 3200 });
    const dock = document.querySelector('[data-panel="todo"]');
    BB.replay(dock, 'celebrate', 1200);
    BB.fx.sparkleAt(dock, 14);
    BB.fx.confetti({ count: 50 });
    const li = document.querySelector(`#panel-body [data-task="${task.id}"]`);
    if (li) BB.replay(li, 'just-done', 1200);
  };

  /* ================= MODALS ================= */
  UI.modal = function (html, o = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal ${o.cls || ''}" role="dialog" aria-modal="true" aria-label="${BB.esc(o.label || 'Dialog')}">${html}</div>`;
    document.getElementById('modal-root').appendChild(wrap);
    const prev = document.activeElement;
    requestAnimationFrame(() => wrap.classList.add('open'));
    const close = () => {
      wrap.classList.remove('open');
      document.removeEventListener('keydown', esc, true);
      setTimeout(() => wrap.remove(), 220);
      if (prev && document.contains(prev)) prev.focus({ preventScroll: true });
      if (o.onClose) o.onClose();
    };
    const esc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('keydown', esc, true);
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap) close();
    });
    setTimeout(() => {
      const f = wrap.querySelector('[autofocus], button');
      if (f) f.focus({ preventScroll: true });
    }, 50);
    return { el: wrap, close };
  };

  UI.confirm = function (msg, yes = 'Yes', no = 'Cancel') {
    return new Promise((resolve) => {
      let answered = false;
      const m = UI.modal(
        `<p class="confirm-msg">${msg}</p><div class="modal-actions"><button class="btn btn-ghost" data-a="no">${no}</button><button class="btn btn-danger" data-a="yes">${yes}</button></div>`,
        { label: 'Confirm', cls: 'confirm', onClose: () => !answered && resolve(false) }
      );
      m.el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        answered = true;
        BB.audio.play('click');
        resolve(b.dataset.a === 'yes');
        m.close();
      });
    });
  };

  UI.openSettings = function () {
    const s = BB.S.settings;
    const opt = (name, val, label) =>
      `<label class="seg"><input type="radio" name="${name}" value="${val}" ${s[name] === val ? 'checked' : ''}><span>${label}</span></label>`;
    const m = UI.modal(
      `<h2 class="modal-title">⚙️ Settings</h2>` +
      `<div class="set-row"><span>Sound effects</span><button class="switch" data-toggle="sound" role="switch" aria-checked="${s.sound}"><span></span></button></div>` +
      `<div class="set-row"><span>Music</span><button class="switch" data-toggle="music" role="switch" aria-checked="${s.music}"><span></span></button></div>` +
      `<fieldset class="set-row col"><legend>Animations</legend><div class="segs">${opt('motion', 'auto', 'Auto')}${opt('motion', 'full', 'Full')}${opt('motion', 'reduce', 'Reduced')}</div></fieldset>` +
      `<fieldset class="set-row col"><legend>Dialogue text speed</legend><div class="segs">${opt('text', 'normal', 'Normal')}${opt('text', 'fast', 'Fast')}${opt('text', 'instant', 'Instant')}</div></fieldset>` +
      `<p class="set-help">Shortcuts: <kbd>T</kbd> to-do · <kbd>I</kbd> inventory · <kbd>M</kbd> map · <kbd>1</kbd>–<kbd>4</kbd> teleport · <kbd>Esc</kbd> close</p>` +
      `<div class="modal-actions spread"><button class="btn btn-ghost" data-act="title">🏠 Title screen</button><button class="btn btn-danger" data-act="reset">↺ Reset Game</button></div>` +
      `<button class="btn btn-primary wide" data-act="close">Done</button>`,
      { label: 'Settings', cls: 'settings' }
    );
    m.el.addEventListener('click', async (e) => {
      const t = e.target.closest('[data-toggle]');
      if (t) {
        const k = t.dataset.toggle;
        s[k] = !s[k];
        t.setAttribute('aria-checked', String(s[k]));
        BB.audio.init();
        BB.audio.syncMusic();
        BB.audio.play('click');
        UI.syncToggles();
        BB.store.saveSoon();
        return;
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      BB.audio.play('click');
      if (a.dataset.act === 'close') m.close();
      if (a.dataset.act === 'title') {
        m.close();
        BB.store.save();
        BB.main.showTitle();
      }
      if (a.dataset.act === 'reset') {
        const ok = await UI.confirm('Reset the game? All party preparations will be lost (your settings stay).', 'Reset', 'Keep playing');
        if (ok) {
          m.close();
          BB.main.resetGame();
        }
      }
    });
    m.el.addEventListener('change', (e) => {
      const i = e.target;
      if (i.name === 'motion' || i.name === 'text') {
        s[i.name] = i.value;
        UI.applyMotion();
        BB.audio.play('click');
        BB.store.saveSoon();
      }
    });
  };
})(window.BB);
