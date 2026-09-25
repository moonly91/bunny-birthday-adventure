/* Bunny Birthday Adventure — finale.js
   The surprise party! Lights out → "SHHHHH…" → Lisa arrives → "SURPRISE!!!" →
   every bunny says something → make a wish → Happy 16th Birthday, Lisa! */
(function (BB) {
  'use strict';

  const F = (BB.finale = {});
  let run = 0;
  let nextResolve = null;
  let root;

  const $ = (sel) => root.querySelector(sel);
  const alive = (id) => id === run;

  F.init = function () {
    root = document.getElementById('finale');
    root.addEventListener('click', (e) => {
      if (e.target.closest('.fin-skip')) {
        BB.audio.play('click');
        F.skip();
        return;
      }
      if (e.target.closest('[data-fin="again"]')) return playAgain();
      if (e.target.closest('[data-fin="view"]')) return viewParty();
      if (e.target.closest('[data-fin="blow"]') || e.target.closest('.fin-stage .cake-on-table.wish')) return blow();
      if (e.target.closest('.fin-caption') || e.target.closest('.fin-tap')) advance();
    });
    document.addEventListener('keydown', (e) => {
      if (!root.classList.contains('is-active')) return;
      if ((e.key === 'Enter' || e.key === ' ') && nextResolve) {
        const f = document.activeElement;
        if (f && f.closest && f.closest('[data-fin]')) return;
        e.preventDefault();
        advance();
      }
    });
  };

  function advance() {
    if (nextResolve) {
      const r = nextResolve;
      nextResolve = null;
      BB.audio.play('soft');
      r();
    }
  }

  const waitNext = () => new Promise((res) => (nextResolve = res));
  const sleep = (ms) => BB.wait(BB.motionOK() ? ms : Math.min(ms, 350));

  function actorHTML(id, pos, extra = '') {
    return (
      `<div class="actor fin-actor actor-${id} ${extra}" data-actor="${id}" style="${BB.party.posStyle(pos)}">` +
      `<span class="actor-inner" style="--d:${(Math.random() * 1.2).toFixed(2)}s">${BB.art.bunny(id, id === 'lisa' ? { partyHat: false } : {})}</span></div>`
    );
  }

  function caption(id, text) {
    const C = BB.CHARS[id];
    const cap = $('.fin-caption');
    cap.style.setProperty('--who', C.color);
    cap.innerHTML =
      `<div class="dlg-portrait talking"><div class="dlg-frame">${BB.art.bunny(id, { portrait: true, partyHat: id === 'lisa' && BB.finaleHat })}</div></div>` +
      `<div class="dlg-main"><div class="dlg-name"><b>${C.name}</b> <small>${C.role}</small></div><p class="dlg-text">${BB.esc(text)}</p></div>` +
      `<button class="dlg-next" aria-label="Continue">▶</button>`;
    cap.hidden = false;
    BB.replay(cap, 'cap-in', 500);
    BB.$$('.fin-actor', root).forEach((a) => a.classList.remove('talking', 'spot'));
    const a = root.querySelector(`.fin-actor[data-actor="${id}"]`);
    if (a) {
      a.classList.add('talking', 'spot');
      BB.replay(a, 'hop', 600);
    }
    for (let i = 0; i < 5; i++) setTimeout(() => BB.audio.play('blip', C.pitch), i * 70);
    setTimeout(() => {
      const nb = cap.querySelector('.dlg-next');
      if (nb) nb.focus({ preventScroll: true });
    }, 60);
  }

  function bigText(text, cls) {
    const t = $('.fin-text');
    t.className = 'fin-text ' + cls;
    t.innerHTML = text;
    t.hidden = false;
    BB.replay(t, 'show', 50);
  }

  function lines() {
    const s = BB.S;
    const choc = s.cake.frosting === 'chocolate';
    const gift = {
      sketchbook: 'Happy birthday, Lisa. We got you a new sketchbook and fancy pencils — for your storybooks.',
      carrot: 'Happy birthday, Lisa. We got you… a giant carrot. It was Milo’s idea. Mostly.',
      scarf: 'Happy birthday, Lisa. We got you a cozy orange scarf. It matches your whole vibe.',
    }[s.surprise.gift || 'sketchbook'];
    return [
      ['milo', 'I definitely helped with this. Probably.'],
      ['poppy', choc ? 'I hope you like the cake! Chocolate frosting — Max’s secret intel!' : 'I hope you like the cake! Baked with extra love. And extra butter.'],
      ['coco', 'I decorated everything! Well… with a LOT of help.'],
      ['hazel', 'And we finished the checklist! Every. Single. Box.'],
      ['bun', s.muffins.done ? 'I only ate one muffin. …Okay, zero. They’re all still there. Happy birthday!' : 'Happy birthday! I brought… myself!'],
      ['max', gift],
    ];
  }

  /** Start the finale. replay=true replays it after the game was already finished. */
  F.start = async function (replay) {
    const id = ++run;
    BB.ui.closePanel();
    if (BB.dialogue.isOpen()) BB.dialogue.close(false, true);
    BB.finaleHat = false;
    BB.audio.setMusicMode('off');
    BB.main.showScreen('finale');
    const s = BB.S;
    let room = BB.party.roomHTML('f', 'finale');
    BB.PARTY_BUNNIES.forEach((b) => (room += actorHTML(b, BB.party.POS.hide[b])));
    room += actorHTML('lisa', { l: 83, dx: 0, b: 30, h: 31, z: 3 }, 'at-door');
    root.innerHTML =
      `<div class="fin-wrap"><div class="stage fin-stage"><div class="scene scene-party finale-scene">${room}</div>` +
      `<div class="fin-dark"></div><div class="fin-beam"></div></div></div>` +
      `<div class="fin-text" hidden></div>` +
      `<div class="fin-caption" hidden role="status" aria-live="polite"></div>` +
      `<div class="fin-prompt" hidden></div>` +
      `<div class="fin-card-wrap" hidden></div>` +
      `<button class="btn btn-ghost fin-skip">Skip ⏩</button>`;
    const stage = $('.fin-stage');
    stage.classList.add('dark');

    await sleep(700);
    if (!alive(id)) return;
    bigText('<span class="shh-emoji" aria-hidden="true">🤫</span> SHHHHH…', 'shh');
    BB.audio.play('squeak');
    await sleep(2400);
    if (!alive(id)) return;
    $('.fin-text').hidden = true;

    // footsteps… the door opens
    for (let i = 0; i < 4; i++) {
      BB.audio.play('step');
      await sleep(380);
      if (!alive(id)) return;
    }
    BB.audio.play('door');
    stage.classList.add('door-open');
    await sleep(700);
    if (!alive(id)) return;
    stage.querySelector('.fin-actor[data-actor="lisa"]').classList.add('arrived');
    await sleep(500);
    caption('lisa', 'Hello…? Max? Is this the clipboard meeting? Why is it so dark in here?');
    await waitNext();
    if (!alive(id)) return;
    $('.fin-caption').hidden = true;

    // LIGHTS! SURPRISE!
    BB.audio.play('switch');
    stage.classList.remove('dark');
    stage.classList.add('lights-on');
    BB.audio.play('surprise');
    bigText('SURPRISE!!!', 'surprise');
    BB.fx.confetti({ count: 180, x: window.innerWidth * 0.25, y: window.innerHeight * 0.7, power: 1.3 });
    BB.fx.confetti({ count: 180, x: window.innerWidth * 0.75, y: window.innerHeight * 0.7, power: 1.3 });
    BB.fx.balloons(16, root);
    BB.finaleHat = true;
    BB.PARTY_BUNNIES.forEach((b, i) => {
      const el = stage.querySelector(`.fin-actor[data-actor="${b}"]`);
      setTimeout(() => {
        el.classList.add('pop-out');
        el.style.cssText = BB.party.posStyle(BB.party.POS.party[b]);
        BB.audio.play('boing');
      }, 120 + i * 110);
    });
    const lisa = stage.querySelector('.fin-actor[data-actor="lisa"]');
    lisa.classList.add('shocked');
    await sleep(1400);
    if (!alive(id)) return;
    lisa.classList.add('walk-in');
    lisa.style.cssText = BB.party.posStyle(BB.party.POS.party.lisa);
    lisa.querySelector('.actor-inner').innerHTML = BB.art.bunny('lisa', { partyHat: true });
    await sleep(1300);
    if (!alive(id)) return;
    $('.fin-text').hidden = true;
    BB.fx.confetti({ count: 60 });

    caption('lisa', 'You guys… you did all this? For ME?!');
    await waitNext();
    if (!alive(id)) return;
    for (const [who, text] of lines()) {
      caption(who, text);
      await waitNext();
      if (!alive(id)) return;
    }
    caption('lisa', 'This is the best birthday EVER. Thank you, everyone! And thank YOU, little helper!');
    await waitNext();
    if (!alive(id)) return;
    $('.fin-caption').hidden = true;
    BB.$$('.fin-actor', root).forEach((a) => a.classList.remove('talking', 'spot'));

    // make a wish!
    const cake = stage.querySelector('.cake-on-table');
    if (cake) cake.classList.add('wish');
    const prompt = $('.fin-prompt');
    prompt.innerHTML = `<p>Make a wish, Lisa! 🎂✨</p><button class="btn btn-primary btn-big" data-fin="blow">🌬️ Blow out the candles!</button>`;
    prompt.hidden = false;
    BB.replay(prompt, 'cap-in', 500);
    prompt.querySelector('button').focus({ preventScroll: true });
    await new Promise((res) => (F._blowResolve = res));
    if (!alive(id)) return;
    await sleep(2400);
    if (!alive(id)) return;
    showCard(replay);
  };

  function blow() {
    if (!F._blowResolve) return;
    const r = F._blowResolve;
    F._blowResolve = null;
    BB.audio.play('blow');
    $('.fin-prompt').hidden = true;
    const stage = $('.fin-stage');
    const cake = stage.querySelector('.cake-on-table');
    if (cake) {
      cake.classList.remove('wish');
      cake.classList.add('blown');
      BB.$$('.flame', cake).forEach((f) => f.classList.add('out'));
    }
    setTimeout(() => {
      BB.audio.happyBirthday();
      BB.fx.confetti({ count: 200 });
      BB.fx.balloons(12, root);
      BB.$$('.fin-actor', root).forEach((a, i) => setTimeout(() => BB.replay(a, 'hop', 600), i * 90));
    }, 700);
    r();
  }

  function fmtTime(ms) {
    const m = Math.max(1, Math.round(ms / 60000));
    return `${m} minute${m === 1 ? '' : 's'}`;
  }

  function showCard() {
    const s = BB.S;
    const firstTime = !s.finished;
    s.finished = true;
    s.tasks.surprise = true;
    BB.game.changed(true);
    BB.store.save();
    const wrap = $('.fin-card-wrap');
    const decor = BB.game.decorCount();
    wrap.innerHTML =
      `<div class="fin-card" role="dialog" aria-label="Happy birthday, Lisa!">` +
      `<div class="fin-card-top"><span class="cal-mini"><small>SEPT</small><b>26</b></span></div>` +
      `<h1>🎂 HAPPY 16TH BIRTHDAY, LISA! 🎂</h1>` +
      `<p class="fin-sub">You helped prepare the perfect bunny birthday party!</p>` +
      `<div class="fin-bunnies" aria-hidden="true">${['milo', 'poppy', 'coco', 'lisa', 'hazel', 'bun', 'max'].map((b) => `<span>${BB.art.bunny(b, { portrait: true, partyHat: b === 'lisa' })}</span>`).join('')}</div>` +
      `<ul class="fin-stats">` +
      `<li><b>${fmtTime(s.stats.playMs)}</b><small>party planning</small></li>` +
      `<li><b>${s.stats.earned}</b><small>carrots found & earned</small></li>` +
      `<li><b>${decor}</b><small>decorations</small></li>` +
      `<li><b>${s.cake.sprinkles}</b><small>sprinkle shakes</small></li>` +
      `<li><b>${s.stats.mistakes}</b><small>happy accidents</small></li>` +
      `</ul>` +
      `<div class="fin-actions"><button class="btn btn-primary btn-big" data-fin="again">↺ PLAY AGAIN</button><button class="btn btn-secondary btn-big" data-fin="view">🎈 VIEW PARTY</button></div>` +
      `</div>`;
    wrap.hidden = false;
    BB.replay(wrap.querySelector('.fin-card'), 'card-in', 900);
    $('.fin-skip').hidden = true;
    BB.audio.play('fanfare');
    BB.fx.confetti({ count: firstTime ? 160 : 80 });
    setTimeout(() => {
      const b = wrap.querySelector('[data-fin="view"]');
      if (b) b.focus({ preventScroll: true });
    }, 400);
  }

  F.skip = function () {
    run += 1;
    nextResolve = null;
    F._blowResolve = null;
    const stage = $('.fin-stage');
    if (stage) {
      stage.classList.remove('dark');
      stage.classList.add('lights-on', 'door-open');
      BB.finaleHat = true;
      BB.PARTY_BUNNIES.concat(['lisa']).forEach((b) => {
        const el = stage.querySelector(`.fin-actor[data-actor="${b}"]`);
        if (el) el.style.cssText = BB.party.posStyle(BB.party.POS.party[b]);
      });
      const lisa = stage.querySelector('.fin-actor[data-actor="lisa"] .actor-inner');
      if (lisa) lisa.innerHTML = BB.art.bunny('lisa', { partyHat: true });
      BB.$$('.flame', stage).forEach((f) => f.classList.add('out'));
    }
    ['.fin-text', '.fin-caption', '.fin-prompt'].forEach((sel) => {
      const el = $(sel);
      if (el) el.hidden = true;
    });
    showCard();
  };

  async function playAgain() {
    BB.audio.play('click');
    const ok = await BB.ui.confirm('Start a brand-new party? Your current game will be reset.', 'Play again', 'Stay here');
    if (!ok) return;
    run += 1;
    BB.main.resetGame();
  }

  function viewParty() {
    BB.audio.play('click');
    run += 1;
    BB.audio.setMusicMode('loop');
    BB.S.location = 'party';
    BB.main.showScreen('game');
    BB.scenes.render();
    BB.ui.updateHUD();
    BB.fx.confetti({ count: 60 });
    BB.fx.toast('🎈 Explore the party! Tap anyone to chat.', { dur: 3000 });
  }
})(window.BB);
