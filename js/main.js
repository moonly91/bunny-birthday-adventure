/* Bunny Birthday Adventure — main.js
   Boot, title screen, screen switching, new game / continue / reset, play timer. */
(function (BB) {
  'use strict';

  const M = (BB.main = {});
  const $ = BB.$;

  M.showScreen = function (name) {
    BB.$$('.screen').forEach((s) => s.classList.toggle('is-active', s.id === (name === 'title' ? 'title-screen' : name)));
    document.body.dataset.screen = name;
  };

  M.showTitle = function () {
    BB.audio.setMusicMode('loop');
    const has = BB.store.hasSave() && BB.S.started;
    $('#btn-continue').hidden = !has;
    $('#btn-newgame').hidden = !has;
    $('#btn-start').hidden = has;
    if (has) {
      const pct = BB.game.progress();
      $('#btn-continue').innerHTML = BB.S.finished ? '▶ CONTINUE — VIEW THE PARTY' : `▶ CONTINUE <small>(${pct}% ready)</small>`;
    }
    M.showScreen('title');
    setTimeout(() => ($('#btn-continue').hidden ? $('#btn-start') : $('#btn-continue')).focus({ preventScroll: true }), 80);
  };

  function enterGame() {
    M.showScreen('game');
    BB.ui.closePanel();
    BB.scenes.render();
    BB.game.changed(true);
    BB.ui.updateHUD();
  }

  M.continueGame = function () {
    BB.audio.init();
    BB.audio.play('pop');
    enterGame();
    if (BB.S.surprise.done && !BB.S.finished) {
      BB.finale.start();
      return;
    }
    const sc = BB.SCENES[BB.S.location];
    BB.fx.toast(`Welcome back! ${BB.LOCATIONS[BB.S.location].icon} ${BB.LOCATIONS[BB.S.location].full}`, { dur: 2000 });
    if (BB.S.location === 'kitchen') BB.scenes.maybeIntro();
    else if (sc && sc.entered && !BB.S.finished) sc.entered();
  };

  M.newGame = function () {
    BB.audio.init();
    BB.audio.play('pop');
    BB.store.reset();
    BB.S.started = true;
    BB.S.location = 'kitchen';
    BB.store.save();
    storyCard(() => {
      enterGame();
      BB.fx.confetti({ count: 70 });
      BB.scenes.maybeIntro();
    });
  };

  M.resetGame = function () {
    BB.store.reset();
    BB.ui.closePanel();
    if (BB.dialogue.isOpen()) BB.dialogue.close(false, true);
    if (BB.minigameOpen) BB.mg.close();
    BB.ui.updateHUD();
    M.showTitle();
    BB.fx.toast('Game reset. Ready for a new party! 🎈', { dur: 2200 });
  };

  /** A little storybook page before the adventure begins. */
  function storyCard(done) {
    const m = BB.ui.modal(
      `<div class="story-art" aria-hidden="true">${['hazel', 'poppy', 'coco', 'max', 'milo', 'bun'].map((b) => `<span>${BB.art.bunny(b, { portrait: true })}</span>`).join('')}</div>` +
      `<h2 class="modal-title">A very important mission</h2>` +
      `<p>Tomorrow is <b>September 26th</b> — Lisa’s <b>16th birthday</b>! 🎂</p>` +
      `<p>Her friends are secretly planning a surprise party… but there’s a cake to bake, muffins to make, a room to decorate, and a secret to keep.</p>` +
      `<p><b>They need your help!</b></p>` +
      `<button class="btn btn-primary btn-big wide" data-go autofocus>Let’s go! 🐰</button>`,
      { label: 'Story', cls: 'story', onClose: () => done && finish() }
    );
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      done();
    }
    m.el.querySelector('[data-go]').addEventListener('click', () => {
      BB.audio.play('click');
      finish();
      m.close();
    });
  }

  function titleDecor() {
    const el = $('#title-deco');
    const colors = ['#ff9a3c', '#ffd54f', '#ff8fab', '#ffb3c7', '#9ad8ff', '#8ed0a8'];
    let h = '';
    for (let i = 0; i < 9; i++) {
      const c = colors[i % colors.length];
      h += `<span class="t-balloon" style="left:${(i * 11 + 3) % 96}%;--dur:${10 + (i % 4) * 2.5}s;--delay:${-(i * 1.7)}s;--w:${38 + (i % 3) * 14}px"><svg viewBox="0 0 60 120"><path d="M30 68 Q24 90 32 120" stroke="#b07a55" stroke-width="1.5" fill="none"/><ellipse cx="30" cy="36" rx="24" ry="30" fill="${c}"/><path d="M26 66 l4 -5 l4 5z" fill="${c}"/><ellipse cx="21" cy="24" rx="5" ry="9" fill="#fff" opacity=".5"/></svg></span>`;
    }
    for (let i = 0; i < 26; i++) {
      h += `<i class="t-confetti" style="left:${(i * 37) % 100}%;background:${colors[i % colors.length]};--dur:${7 + (i % 5)}s;--delay:${-(i * 0.9)}s;--r:${(i * 47) % 360}deg"></i>`;
    }
    h += `<div class="t-bunting">${BB.art.banner()}</div>`;
    el.innerHTML = h;
    $('#title-hero').innerHTML =
      `<div class="hero-bunny">${BB.art.bunny('poppy')}</div>` +
      `<div class="hero-cake">${BB.art.cake({ frosting: 'strawberry', sprinkles: 6, candles: '16', lit: true })}</div>` +
      `<div class="hero-lisa-note" aria-hidden="true">shh… it’s a surprise!</div>`;
  }

  /* play-time tracking (only while playing & visible) */
  function startTimer() {
    let n = 0;
    setInterval(() => {
      if (document.hidden || !BB.S.started) return;
      const scr = document.body.dataset.screen;
      if ((scr === 'game' || scr === 'finale') && !BB.S.finished) {
        BB.S.stats.playMs += 1000;
        if (++n % 10 === 0) BB.store.saveSoon();
      }
    }, 1000);
  }

  /** When served from a website (e.g. GitHub Pages), cache the game so the link also works offline
      and can be installed to a phone's home screen. Opening index.html from disk skips this. */
  function enableOfflineInstall() {
    const web = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!web) return;
    try {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = 'manifest.webmanifest';
      document.head.appendChild(link);
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
    } catch (e) {
      /* sandboxed frames refuse service workers — the game still plays online */
    }
  }

  function boot() {
    BB.store.load();
    BB.ui.init();
    BB.dialogue.init();
    BB.scenes.init();
    BB.finale.init();
    titleDecor();
    BB.game.refreshTasks(true);
    BB.ui.updateHUD();

    $('#btn-start').addEventListener('click', M.newGame);
    $('#btn-continue').addEventListener('click', M.continueGame);
    $('#btn-newgame').addEventListener('click', async () => {
      BB.audio.init();
      BB.audio.play('click');
      const ok = await BB.ui.confirm('Start a new game? Your saved progress will be replaced.', 'New game', 'Cancel');
      if (ok) M.newGame();
    });
    $('#title-hero').addEventListener('click', () => {
      BB.audio.init();
      BB.audio.play('boing');
      BB.replay($('.hero-bunny'), 'hop', 700);
      BB.fx.sparkleAt($('.hero-bunny'), 10);
    });
    // first interaction anywhere unlocks audio (browser autoplay rules)
    const unlock = () => {
      BB.audio.init();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const f = () => BB.ui.applyMotion();
      if (mq.addEventListener) mq.addEventListener('change', f);
    }
    // global button click feedback
    document.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.btn, .dock-btn, .icon-btn');
      if (b) BB.replay(b, 'press', 180);
    });

    startTimer();
    enableOfflineInstall();
    M.showTitle();
    document.documentElement.classList.add('ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.BB);
