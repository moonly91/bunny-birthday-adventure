/* Bunny Birthday Adventure — audio.js
   Every sound is synthesised with the Web Audio API: no audio files, fully offline. */
(function (BB) {
  'use strict';

  const A = (BB.audio = {});
  let ctx = null;
  let master = null;
  let sfxBus = null;
  let musicBus = null;
  let noiseBuf = null;

  A.init = function () {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        ctx = new AC();
      } catch (e) {
        return;
      }
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      sfxBus = ctx.createGain();
      sfxBus.gain.value = 0.7;
      sfxBus.connect(master);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0;
      musicBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    A.syncMusic();
  };

  const soundOn = () => ctx && BB.S.settings.sound;

  function tone(freq, o = {}) {
    if (!ctx) return;
    const { type = 'sine', dur = 0.15, vol = 0.2, attack = 0.006, slide = null, delay = 0, bus = sfxBus } = o;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function noise(o = {}) {
    if (!ctx) return null;
    const { dur = 0.2, vol = 0.2, type = 'bandpass', freq = 1000, q = 1, delay = 0, slide = null, attack = 0.006, loop = false } = o;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    f.Q.value = q;
    if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    if (!loop) g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(sfxBus);
    src.start(t, Math.random());
    if (!loop) src.stop(t + dur + 0.05);
    return { src, g };
  }

  const arp = (notes, o = {}) => notes.forEach((f, i) => tone(f, Object.assign({ delay: i * (o.gap || 0.07) }, o)));

  const SFX = {
    click: () => tone(760, { type: 'triangle', dur: 0.07, vol: 0.12 }),
    soft: () => tone(540, { type: 'sine', dur: 0.08, vol: 0.08 }),
    pop: () => tone(420, { slide: 900, dur: 0.12, vol: 0.18 }),
    open: () => arp([523, 784], { type: 'sine', dur: 0.12, vol: 0.09, gap: 0.05 }),
    close: () => arp([659, 440], { type: 'sine', dur: 0.1, vol: 0.07, gap: 0.05 }),
    carrot: () => {
      tone(988, { type: 'triangle', dur: 0.1, vol: 0.16 });
      tone(1319, { type: 'triangle', dur: 0.2, vol: 0.16, delay: 0.08 });
    },
    buy: () => {
      arp([523, 659, 784, 1047], { type: 'triangle', dur: 0.16, vol: 0.14 });
      tone(2093, { type: 'sine', dur: 0.3, vol: 0.05, delay: 0.3 });
    },
    error: () => {
      tone(262, { type: 'square', dur: 0.12, vol: 0.05 });
      tone(196, { type: 'square', dur: 0.2, vol: 0.05, delay: 0.1 });
    },
    task: () => {
      arp([659, 784, 988, 1319], { type: 'sine', dur: 0.32, vol: 0.13, gap: 0.09 });
      arp([2637, 3136], { type: 'sine', dur: 0.2, vol: 0.03, gap: 0.05, delay: 0.4 });
    },
    blip: (p = 520) => tone(p * (0.94 + Math.random() * 0.12), { type: 'triangle', dur: 0.045, vol: 0.045 }),
    whoosh: () => noise({ dur: 0.5, vol: 0.14, type: 'bandpass', freq: 300, slide: 2600, q: 0.8, attack: 0.18 }),
    crack: () => {
      noise({ dur: 0.07, vol: 0.4, type: 'highpass', freq: 2200 });
      tone(160, { type: 'square', dur: 0.05, vol: 0.05, delay: 0.02 });
      tone(700, { slide: 300, dur: 0.12, vol: 0.06, delay: 0.06 });
    },
    plop: () => tone(300, { slide: 120, dur: 0.14, vol: 0.2 }),
    puff: () => noise({ dur: 0.55, vol: 0.2, type: 'lowpass', freq: 900, slide: 200, attack: 0.02 }),
    stir: () => noise({ dur: 0.18, vol: 0.09, type: 'bandpass', freq: 700 + Math.random() * 500, q: 2, attack: 0.05 }),
    ding: () => {
      tone(1568, { dur: 1.3, vol: 0.18 });
      tone(2349, { dur: 0.9, vol: 0.07 });
      tone(3136, { dur: 0.5, vol: 0.04 });
    },
    tick: () => tone(1250, { type: 'square', dur: 0.03, vol: 0.04 }),
    sprinkle: () => {
      for (let i = 0; i < 6; i++) tone(2000 + Math.random() * 2200, { dur: 0.04, vol: 0.035, delay: i * 0.03 });
    },
    place: () => {
      tone(320, { slide: 640, dur: 0.1, vol: 0.18 });
      tone(1320, { dur: 0.22, vol: 0.07, delay: 0.08 });
    },
    rustle: () => noise({ dur: 0.4, vol: 0.14, type: 'bandpass', freq: 3200, q: 0.6, attack: 0.06 }),
    horn: () => {
      tone(330, { type: 'sawtooth', slide: 560, dur: 0.45, vol: 0.06 });
      tone(335, { type: 'square', slide: 565, dur: 0.45, vol: 0.03 });
    },
    blow: () => noise({ dur: 1.0, vol: 0.22, type: 'lowpass', freq: 1400, slide: 250, attack: 0.1 }),
    boing: () => tone(190, { slide: 520, dur: 0.24, vol: 0.13 }),
    oops: () => tone(560, { slide: 240, dur: 0.32, vol: 0.1, type: 'triangle' }),
    squeak: () => tone(900, { slide: 1600, dur: 0.12, vol: 0.08 }),
    door: () => {
      tone(180, { type: 'triangle', slide: 120, dur: 0.5, vol: 0.08 });
      noise({ dur: 0.4, vol: 0.05, type: 'lowpass', freq: 500 });
    },
    switch: () => {
      tone(1800, { type: 'square', dur: 0.02, vol: 0.06 });
      tone(900, { type: 'square', dur: 0.02, vol: 0.05, delay: 0.04 });
    },
    step: () => tone(120, { type: 'sine', dur: 0.08, vol: 0.12 }),
    surprise: () => {
      SFX.horn();
      arp([523, 659, 784, 1047, 1319, 1568], { type: 'triangle', dur: 0.3, vol: 0.12, gap: 0.06, delay: 0.05 });
      noise({ dur: 0.8, vol: 0.12, type: 'highpass', freq: 3000, delay: 0.1 });
    },
    fanfare: () => {
      const n = [523, 659, 784, 1047, 784, 1047];
      const d = [0, 0.14, 0.28, 0.42, 0.62, 0.76];
      n.forEach((f, i) => tone(f, { type: 'triangle', dur: i === 5 ? 0.6 : 0.16, vol: 0.14, delay: d[i] }));
    },
  };

  A.play = (name, ...args) => {
    if (!soundOn() || !SFX[name]) return;
    try {
      SFX[name](...args);
    } catch (e) {
      /* never let audio break the game */
    }
  };

  /** Continuous sound (e.g. pouring milk). Returns a stop() function. */
  A.loop = (kind) => {
    if (!soundOn()) return () => {};
    const n = kind === 'pour' ? noise({ type: 'lowpass', freq: 650, q: 3, vol: 0.12, loop: true, attack: 0.05 }) : null;
    return () => {
      if (!n) return;
      const t = ctx.currentTime;
      n.g.gain.cancelScheduledValues(t);
      n.g.gain.setValueAtTime(n.g.gain.value, t);
      n.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      n.src.stop(t + 0.15);
    };
  };

  /* ---------- Background music: a little music-box loop ---------- */
  const N = (s) => 440 * Math.pow(2, s / 12); // semitones from A4
  const C4 = N(-9), D4 = N(-7), E4 = N(-5), F4 = N(-4), G4 = N(-2), A4 = N(0), B4 = N(2);
  const C5 = N(3), D5 = N(5), E5 = N(7), F5 = N(8), G5 = N(10), A5 = N(12);
  const CHORDS = [
    [C4, E4, G4],
    [A4 / 2, C4, E4],
    [F4 / 2 * 2, A4, C5],
    [G4, B4, D5],
  ];
  const MELODY = [
    [E5, G5, E5, C5], [A4, C5, E5, D5], [C5, A4, F4, A4], [B4, D5, G5, 0],
    [E5, G5, A5, G5], [E5, C5, D5, E5], [F5, E5, D5, C5], [D5, B4, C5, 0],
  ];
  const EIGHTH = 0.3;
  let musicTimer = null;
  let nextTime = 0;
  let stepN = 0;
  let musicMode = 'loop'; // 'loop' | 'off' (finale plays its own tune)

  function box(freq, t, vol, dur) {
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o2.type = 'sine';
    o.frequency.value = freq;
    o2.frequency.value = freq * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    o2.connect(g2);
    g2.connect(g);
    g.connect(musicBus);
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 0.05);
    o2.stop(t + dur + 0.05);
  }

  function playStep(i, t) {
    const bar = Math.floor(i / 8) % 8;
    const beat = i % 8;
    const chord = CHORDS[bar % 4];
    // soft arpeggio
    const pat = [0, 1, 2, 1, 2, 1, 0, 1];
    box(chord[pat[beat]] * 2, t, 0.035, 0.9);
    // bass on beats 1 and 3
    if (beat === 0 || beat === 4) box(chord[0] / 2, t, 0.05, 1.2);
    // melody on quarter notes
    if (beat % 2 === 0) {
      const m = MELODY[bar][beat / 2];
      if (m) box(m, t, 0.06, 1.1);
    }
  }

  function schedule() {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.4) {
      playStep(stepN, nextTime);
      nextTime += EIGHTH;
      stepN = (stepN + 1) % 64;
    }
  }

  A.syncMusic = function () {
    if (!ctx) return;
    const want = BB.S.settings.sound && BB.S.settings.music && musicMode === 'loop' && !document.hidden;
    const t = ctx.currentTime;
    if (want && !musicTimer) {
      nextTime = t + 0.1;
      musicTimer = setInterval(schedule, 100);
      musicBus.gain.cancelScheduledValues(t);
      musicBus.gain.setValueAtTime(musicBus.gain.value, t);
      musicBus.gain.linearRampToValueAtTime(0.55, t + 1.2);
    } else if (!want && musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
      musicBus.gain.cancelScheduledValues(t);
      musicBus.gain.setValueAtTime(musicBus.gain.value, t);
      musicBus.gain.linearRampToValueAtTime(0, t + 0.3);
    }
  };

  A.setMusicMode = (mode) => {
    musicMode = mode;
    A.syncMusic();
  };

  /** "Happy Birthday" (public-domain melody) on a music box, for the finale. */
  A.happyBirthday = function () {
    if (!soundOn()) return;
    const q = 0.42;
    const song = [
      [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
      [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
      [G4, 0.75], [G4, 0.25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
      [F5, 0.75], [F5, 0.25], [E5, 1], [C5, 1], [D5, 1], [C5, 3],
    ];
    const bus = musicBus;
    const t0 = ctx.currentTime + 0.1;
    bus.gain.cancelScheduledValues(t0);
    bus.gain.setValueAtTime(0.7, t0);
    let t = t0;
    song.forEach(([f, d]) => {
      box(f, t, 0.11, Math.max(0.5, d * q * 1.6));
      box(f / 2, t, 0.03, 0.6);
      t += d * q;
    });
  };

  document.addEventListener('visibilitychange', () => A.syncMusic());
})(window.BB);
