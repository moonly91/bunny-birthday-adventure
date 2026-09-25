/* Bunny Birthday Adventure — dialogue.js
   Dialogue box engine: portrait, name tag, typewriter text with voice blips,
   multiple-choice responses, instant replay of already-seen lines, and Skip. */
(function (BB) {
  'use strict';

  const D = (BB.dialogue = {});
  let cur = null; // { convo, charId, nodeId, resolve, typing, full, timer }
  let root;

  const SPEED = { normal: 26, fast: 11, instant: 0 };

  D.isOpen = () => !!cur;

  D.init = function () {
    root = document.getElementById('dialogue');
    root.addEventListener('click', (e) => {
      if (!cur) return;
      const ch = e.target.closest('[data-choice]');
      if (ch) {
        choose(+ch.dataset.choice);
        return;
      }
      if (e.target.closest('.dlg-skip')) {
        BB.audio.play('click');
        D.close(true);
        return;
      }
      if (e.target.closest('.dlg-next') || e.target.closest('.dlg-box')) advance();
    });
    document.addEventListener('keydown', (e) => {
      if (!cur || document.querySelector('.modal-wrap')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        const onChoice = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-choice]');
        if (onChoice) return; // let the focused button handle it
        e.preventDefault();
        advance();
      } else if (/^[1-4]$/.test(e.key)) {
        const btn = root.querySelector(`[data-choice="${+e.key - 1}"]`);
        if (btn) {
          e.preventDefault();
          choose(+e.key - 1);
        }
      } else if (e.key === 'Escape' && cur.skippable) {
        e.preventDefault();
        D.close(true);
      }
    });
  };

  /** Open a conversation. Resolves when it closes. */
  D.open = function (charId, convo) {
    if (cur) D.close(false, true);
    if (BB.ui) BB.ui.closePanel();
    return new Promise((resolve) => {
      cur = { convo, charId, resolve, skippable: !!BB.S.convos[convo.id] };
      root.hidden = false;
      root.classList.remove('closing');
      requestAnimationFrame(() => root.classList.add('open'));
      BB.audio.play('open');
      if (BB.PARTY_BUNNIES.includes(charId) || charId === 'shop') {
        BB.game.talked(charId);
        BB.game.changed();
      }
      show(convo.start || 'start');
    });
  };

  function nodeText(n) {
    return typeof n.t === 'function' ? n.t(BB.S) : n.t;
  }

  function speakerEl(id) {
    return document.querySelector(`.scene [data-actor="${id}"]`);
  }

  function setTalking(id, on) {
    BB.$$('.scene .actor.talking').forEach((el) => el.classList.remove('talking'));
    const el = speakerEl(id);
    if (el && on) el.classList.add('talking');
    const portrait = root.querySelector('.dlg-portrait');
    if (portrait) portrait.classList.toggle('talking', on);
  }

  function show(nodeId) {
    if (!cur) return;
    const { convo } = cur;
    if (!nodeId || nodeId === 'end') {
      D.close(true);
      return;
    }
    const n = convo.nodes[nodeId];
    if (!n) {
      D.close(true);
      return;
    }
    cur.nodeId = nodeId;
    if (n.do) n.do(BB.S);
    const who = n.who || cur.charId;
    const C = BB.CHARS[who] || { name: '???', role: '', color: '#b07a4a', pitch: 500 };
    const key = convo.id + ':' + nodeId;
    const seen = !!BB.S.seen[key];
    BB.S.seen[key] = true;
    const text = nodeText(n);
    cur.full = text;
    cur.who = who;

    const choices = (n.choices || []).filter((c) => !c.if || c.if(BB.S));
    cur.choices = choices;

    root.style.setProperty('--who', C.color);
    root.innerHTML =
      `<div class="dlg-box">` +
      `<div class="dlg-portrait"><div class="dlg-frame">${BB.art.bunny(who, { portrait: true })}</div></div>` +
      `<div class="dlg-main">` +
      `<div class="dlg-name"><b>${C.name}</b> <span class="dlg-emoji" aria-hidden="true">🐰</span><small>${C.role}</small></div>` +
      `<p class="dlg-text" aria-live="polite"></p>` +
      `<div class="dlg-choices" hidden>${choices.length ? '<div class="dlg-prompt">What do you say?</div>' : ''}${choices
        .map((c, i) => `<button class="dlg-choice" data-choice="${i}"><kbd aria-hidden="true">${i + 1}</kbd><span>“${typeof c.l === 'function' ? c.l(BB.S) : c.l}”</span></button>`)
        .join('')}</div>` +
      `</div>` +
      `<button class="dlg-next" hidden aria-label="Continue">▶</button>` +
      `</div>` +
      (cur.skippable ? `<button class="dlg-skip" aria-label="Skip this conversation">Skip ⏩</button>` : '');

    const p = root.querySelector('.dlg-text');
    const speed = SPEED[BB.S.settings.text] ?? 26;
    setTalking(who, true);
    if (seen || speed === 0 || !BB.motionOK()) {
      p.textContent = text;
      finishTyping();
      if (seen) root.querySelector('.dlg-box').classList.add('seen');
      return;
    }
    cur.typing = true;
    let i = 0;
    clearInterval(cur.timer);
    cur.timer = setInterval(() => {
      if (!cur) return;
      i += 1;
      p.textContent = text.slice(0, i);
      if (i % 3 === 1 && /\w/.test(text[i - 1] || '')) BB.audio.play('blip', C.pitch);
      if (i >= text.length) finishTyping();
    }, speed);
  }

  function finishTyping() {
    if (!cur) return;
    clearInterval(cur.timer);
    cur.typing = false;
    const p = root.querySelector('.dlg-text');
    if (p) p.textContent = cur.full;
    setTimeout(() => cur && setTalking(cur.who, false), 250);
    const ch = root.querySelector('.dlg-choices');
    if (cur.choices.length) {
      ch.hidden = false;
      const first = ch.querySelector('button');
      if (first) first.focus({ preventScroll: true });
    } else {
      const nx = root.querySelector('.dlg-next');
      nx.hidden = false;
      nx.focus({ preventScroll: true });
    }
  }

  function advance() {
    if (!cur) return;
    if (cur.typing) {
      finishTyping();
      return;
    }
    if (cur.choices && cur.choices.length) return;
    const n = cur.convo.nodes[cur.nodeId];
    BB.audio.play('soft');
    show(n.next || 'end');
  }

  function choose(i) {
    if (!cur || cur.typing) return;
    const c = cur.choices[i];
    if (!c) return;
    BB.audio.play('click');
    if (c.do) c.do(BB.S);
    show(c.next || 'end');
  }

  /** Close the dialogue. completed=true marks the conversation as finished and runs its end hooks. */
  D.close = function (completed, silent) {
    if (!cur) return;
    const c = cur;
    cur = null;
    clearInterval(c.timer);
    setTalking(c.who, false);
    if (completed) {
      BB.S.convos[c.convo.id] = (BB.S.convos[c.convo.id] || 0) + 1;
      if (c.convo.onEnd) c.convo.onEnd(BB.S);
    }
    root.classList.remove('open');
    root.classList.add('closing');
    if (!silent) BB.audio.play('close');
    setTimeout(() => {
      if (!cur) {
        root.hidden = true;
        root.classList.remove('closing');
        root.innerHTML = '';
      }
    }, 220);
    BB.game.changed();
    if (BB.scenes) BB.scenes.refreshIndicators();
    c.resolve(completed);
    if (completed && c.convo.after) setTimeout(() => c.convo.after(BB.S), 250);
  };
})(window.BB);
