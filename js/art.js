/* Bunny Birthday Adventure — art.js
   All artwork is hand-built inline SVG, so the game needs no image files.
   Characters share one construction (head, ears, body, face) and differ by
   silhouette, outfit and accessories so each bunny is easy to recognise. */
(function (BB) {
  'use strict';

  const A = (BB.art = {});
  const L = '#6b3f2a'; // shared outline colour for props & icons
  const SW = 'stroke-width';

  /* ================================================================
     BUNNIES
     ================================================================ */
  const PAL = {
    lisa: { fur: '#fbe4d5', inner: '#ffabbd', belly: '#fff6ef', line: '#8b5a45' },
    poppy: { fur: '#fff8ee', inner: '#ffb6c0', belly: '#ffffff', line: '#8d6c55' },
    coco: { fur: '#dcaa80', inner: '#ffc3d0', belly: '#f6dfc8', line: '#7a4a2c' },
    hazel: { fur: '#c0b3a6', inner: '#f5bbb4', belly: '#efe7df', line: '#5f5048' },
    milo: { fur: '#f4aa62', inner: '#ffc7a8', belly: '#fee7ca', line: '#8a4a1c' },
    bun: { fur: '#fffdf8', inner: '#ffcad3', belly: '#ffffff', line: '#907b67' },
    max: { fur: '#96725c', inner: '#eeaea5', belly: '#dfc5ab', line: '#4e3526' },
    shop: { fur: '#ddbb93', inner: '#f4bdab', belly: '#f4e1c9', line: '#72502f' },
  };
  A.PAL = PAL;

  const HEAD = 'M100 61 C138 61 156 86 155 111 C154 139 131 156 100 156 C69 156 46 139 45 111 C44 86 62 61 100 61 Z';
  const BODY = 'M100 148 C131 148 146 176 145 205 C144 234 124 250 100 250 C76 250 56 234 55 205 C54 176 69 148 100 148 Z';

  function ear(cx, cy, rot, p, side, o = {}) {
    const len = o.len || 36;
    const w = o.w || 15;
    const base = cy + len - 6;
    return (
      `<g class="ear ear-${side}"><g transform="rotate(${rot} ${cx} ${base})">` +
      `<ellipse cx="${cx}" cy="${cy}" rx="${w}" ry="${len}" fill="${o.fill || p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
      `<ellipse cx="${cx}" cy="${cy + 5}" rx="${w * 0.5}" ry="${len * 0.7}" fill="${p.inner}"/>` +
      (o.tip ? `<ellipse cx="${cx}" cy="${cy - len + 10}" rx="${w * 0.8}" ry="9" fill="${o.tip}"/>` : '') +
      `</g></g>`
    );
  }

  function eye(x, o = {}) {
    const rx = o.big ? 7.6 : 6.6;
    const ry = o.big ? 9.6 : 8.6;
    let s =
      `<ellipse cx="${x}" cy="112" rx="${rx}" ry="${ry}" fill="#3a221c"/>` +
      `<circle cx="${x + 2.6}" cy="${112 - ry * 0.45}" r="${o.big ? 3.2 : 2.7}" fill="#fff"/>` +
      `<circle cx="${x - 1.9}" cy="${112 + ry * 0.38}" r="1.3" fill="#fff"/>`;
    if (o.lash) {
      const d = x < 100 ? -1 : 1;
      s += `<path d="M${x + d * 5} ${105} l${d * 5} -4 M${x + d * 6.5} ${109} l${d * 6} -1.5" stroke="#3a221c" ${SW}="2" stroke-linecap="round"/>`;
    }
    if (o.lid) {
      s += `<path d="M${x - 8} 111 Q${x} 99 ${x + 8} 111 L${x + 8} 101 L${x - 8} 101 Z" fill="${o.lid}"/>` +
        `<path d="M${x - 7.5} 110.5 Q${x} 105.5 ${x + 7.5} 110.5" stroke="#3a221c" ${SW}="2.2" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  }

  const eyes = (o) => `<g class="eyes">${eye(80, o)}${eye(120, o)}</g>`;
  const cheeks = (c = '#ff8fa3', op = 0.5) =>
    `<ellipse cx="66" cy="128" rx="9.5" ry="5.8" fill="${c}" opacity="${op}"/><ellipse cx="134" cy="128" rx="9.5" ry="5.8" fill="${c}" opacity="${op}"/>`;
  const nose = (p) =>
    `<path d="M95.5 121 Q100 118 104.5 121 Q103 125.5 100 126 Q97 125.5 95.5 121 Z" fill="#ef8a9b" stroke="${p.line}" ${SW}="1.2"/>`;
  const mouth = (p) =>
    `<path class="mouth" d="M100 126 L100 129 M93 129 Q96.5 133.5 100 129 Q103.5 133.5 107 129" fill="none" stroke="${p.line}" ${SW}="2.2" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<ellipse class="mouth-open" cx="100" cy="133" rx="4.8" ry="4.2" fill="#a2434a" stroke="${p.line}" ${SW}="1.4"/>`;
  const whiskers = (p) =>
    `<g stroke="${p.line}" ${SW}="1.3" opacity=".35" stroke-linecap="round" fill="none"><path d="M60 122 L42 118 M60 127 L42 128 M140 122 L158 118 M140 127 L158 128"/></g>`;
  const armShape = (cx, cy, rot, p, fill) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="21" transform="rotate(${rot} ${cx} ${cy})" fill="${fill || p.fur}" stroke="${p.line}" ${SW}="2.5"/>`;

  /* ----- per-character details ----- */
  const BUILD = {
    poppy(p) {
      return {
        ears: ear(66, 52, -26, p, 'l') + ear(134, 52, 26, p, 'r'),
        outfit:
          `<path d="M80 158 H120 V180 H80 Z" fill="#ff9d7a" stroke="${p.line}" ${SW}="2"/>` +
          `<path d="M70 178 H130 L137 236 Q100 247 63 236 Z" fill="#ff9d7a" stroke="${p.line}" ${SW}="2.2" stroke-linejoin="round"/>` +
          `<g fill="#fff" opacity=".85"><circle cx="80" cy="192" r="2.4"/><circle cx="120" cy="194" r="2.4"/><circle cx="76" cy="222" r="2.4"/><circle cx="124" cy="224" r="2.4"/><circle cx="100" cy="186" r="2.2"/><circle cx="90" cy="168" r="2"/><circle cx="110" cy="170" r="2"/></g>` +
          `<path d="M87 204 h26 v12 q-13 8 -26 0 z" fill="#ffc6b3" stroke="${p.line}" ${SW}="1.8"/>` +
          `<path d="M100 216 l-4.5 -4.5 a2.8 2.8 0 0 1 4.5 -3.6 a2.8 2.8 0 0 1 4.5 3.6 z" fill="#ff5c7a"/>`,
        hat:
          `<g class="chef-hat"><path d="M70 82 C58 62 72 40 91 47 C95 26 123 24 128 45 C147 40 152 66 131 82 Z" fill="#fff" stroke="${p.line}" ${SW}="2.5" stroke-linejoin="round"/>` +
          `<path d="M92 52 Q96 62 93 72 M110 48 Q113 60 110 72" stroke="#e9ded0" ${SW}="2.5" fill="none" stroke-linecap="round"/>` +
          `<path d="M71 70 Q100 62 130 70 L131 85 Q100 77 70 85 Z" fill="#fff" stroke="${p.line}" ${SW}="2.5" stroke-linejoin="round"/></g>`,
        face: `<ellipse cx="139" cy="119" rx="6.5" ry="3.2" fill="#fff" transform="rotate(-18 139 119)"/><circle cx="146" cy="113" r="1.6" fill="#fff"/>`,
        armR:
          armShape(146, 178, -48, p) +
          `<g transform="rotate(18 160 160)"><rect x="156" y="158" width="7" height="26" rx="3.5" fill="#d9965c" stroke="${p.line}" ${SW}="2"/>` +
          `<path d="M159.5 158 C146 140 148 118 159.5 113 C171 118 173 140 159.5 158 M159.5 158 C153 140 154 122 159.5 113 M159.5 158 C166 140 165 122 159.5 113" stroke="#8fa0ad" ${SW}="2.2" fill="none"/></g>`,
      };
    },

    coco(p) {
      return {
        ears: ear(80, 44, -12, p, 'l') + ear(121, 44, 14, p, 'r', { tip: '#c38b60' }),
        outfit:
          `<path d="M62 192 C62 168 78 156 100 156 C122 156 138 168 138 192 L145 236 Q100 251 55 236 Z" fill="#ffd76a" stroke="${p.line}" ${SW}="2.2" stroke-linejoin="round"/>` +
          `<g fill="#ff8fb1"><circle cx="78" cy="190" r="3.2"/><circle cx="100" cy="202" r="3.2"/><circle cx="122" cy="188" r="3.2"/><circle cx="72" cy="224" r="3.2"/><circle cx="96" cy="232" r="3.2"/><circle cx="120" cy="222" r="3.2"/><circle cx="110" cy="178" r="2.6"/></g>` +
          `<path d="M83 157 Q90 174 100 162 Q110 174 117 157" fill="#fff" stroke="${p.line}" ${SW}="2" stroke-linejoin="round"/>`,
        hat:
          `<g class="bow"><path d="M75 71 L55 58 Q48 71 55 85 Z" fill="#ff7aa8" stroke="${p.line}" ${SW}="2" stroke-linejoin="round"/>` +
          `<path d="M75 71 L95 58 Q102 71 95 85 Z" fill="#ff7aa8" stroke="${p.line}" ${SW}="2" stroke-linejoin="round"/>` +
          `<path d="M58 64 Q55 71 58 78 M92 64 Q95 71 92 78" stroke="#ffb3cd" ${SW}="2.5" fill="none" stroke-linecap="round"/>` +
          `<circle cx="75" cy="71" r="6" fill="#ff5c93" stroke="${p.line}" ${SW}="2"/></g>`,
        eyes: eyes({ lash: true }),
        armL:
          armShape(56, 176, 40, p) +
          `<g class="held-balloon"><path d="M42 166 Q26 124 32 80" stroke="#8a5a44" ${SW}="1.6" fill="none"/>` +
          `<ellipse cx="30" cy="52" rx="20" ry="25" fill="#ff8fb1" stroke="${p.line}" ${SW}="2.2"/>` +
          `<path d="M27 77 l3 -3.5 l3 3.5 z" fill="#ff8fb1" stroke="${p.line}" ${SW}="1.5"/>` +
          `<ellipse cx="23" cy="42" rx="5" ry="8" fill="#fff" opacity=".6"/></g>`,
      };
    },

    hazel(p) {
      return {
        ears: ear(83, 40, -4, p, 'l', { len: 39 }) + ear(117, 40, 5, p, 'r', { len: 39 }),
        outfit:
          `<path d="M56 205 C55 176 70 154 100 154 C130 154 145 176 144 205 C143 234 124 250 100 250 C76 250 57 234 56 205 Z" fill="#9ccaa4" stroke="${p.line}" ${SW}="2.2"/>` +
          `<path d="M84 156 L100 188 L116 156 Z" fill="${p.belly}" stroke="${p.line}" ${SW}="1.6" stroke-linejoin="round"/>` +
          `<g class="clipboard"><rect x="71" y="178" width="58" height="62" rx="5" fill="#c98a55" stroke="${p.line}" ${SW}="2.2"/>` +
          `<rect x="76" y="186" width="48" height="50" rx="2" fill="#fffdf6"/>` +
          `<rect x="89" y="173" width="22" height="10" rx="3" fill="#aab4bd" stroke="${p.line}" ${SW}="1.8"/>` +
          `<path d="M80 197 l3 3 l5 -6 M80 211 l3 3 l5 -6" stroke="#4caf6a" ${SW}="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
          `<rect x="80" y="222" width="8" height="8" rx="1.5" fill="none" stroke="#b7a89a" ${SW}="1.8"/>` +
          `<path d="M92 198 H118 M92 212 H116 M92 226 H112" stroke="#c9bdb2" ${SW}="2.4" stroke-linecap="round"/></g>`,
        armL: armShape(70, 200, -12, p, '#9ccaa4') + `<ellipse cx="73" cy="214" rx="7" ry="6" fill="${p.fur}" stroke="${p.line}" ${SW}="2"/>`,
        armR: armShape(130, 200, 12, p, '#9ccaa4') + `<ellipse cx="127" cy="214" rx="7" ry="6" fill="${p.fur}" stroke="${p.line}" ${SW}="2"/>`,
        face:
          `<g fill="rgba(255,255,255,.2)" stroke="#6b4a36" ${SW}="2.6"><circle cx="80" cy="112" r="13"/><circle cx="120" cy="112" r="13"/></g>` +
          `<path d="M93 110 Q100 105 107 110" stroke="#6b4a36" ${SW}="2.6" fill="none"/>` +
          `<path d="M67 108 L56 104 M133 108 L144 104" stroke="#6b4a36" ${SW}="2.2"/>`,
        hat:
          `<path d="M90 66 Q100 54 110 66" fill="${p.fur}" stroke="${p.line}" ${SW}="2"/>` +
          `<g transform="rotate(38 138 72)"><rect x="132" y="50" width="8" height="34" rx="2" fill="#ffd54f" stroke="${p.line}" ${SW}="1.8"/>` +
          `<rect x="132" y="50" width="8" height="7" rx="2" fill="#ff8fab" stroke="${p.line}" ${SW}="1.8"/>` +
          `<path d="M132 84 L136 92 L140 84 Z" fill="#f3d2a7" stroke="${p.line}" ${SW}="1.6"/></g>`,
      };
    },

    milo(p) {
      const bent =
        `<g class="ear ear-r"><g transform="rotate(14 122 80)">` +
        `<ellipse cx="122" cy="58" rx="14" ry="24" fill="${p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
        `<ellipse cx="122" cy="62" rx="7" ry="16" fill="${p.inner}"/></g>` +
        `<g transform="rotate(64 138 38)"><ellipse cx="141" cy="40" rx="11" ry="19" fill="${p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
        `<ellipse cx="141" cy="42" rx="5" ry="12" fill="${p.inner}"/></g></g>`;
      return {
        ears: ear(80, 44, -16, p, 'l') + bent,
        back: `<path d="M58 164 Q100 140 142 164 Q150 182 132 186 Q100 168 68 186 Q50 182 58 164 Z" fill="#5d93cc" stroke="${p.line}" ${SW}="2.2"/>`,
        outfit:
          `<path d="M56 205 C55 176 70 154 100 154 C130 154 145 176 144 205 C143 234 124 250 100 250 C76 250 57 234 56 205 Z" fill="#72a9e0" stroke="${p.line}" ${SW}="2.2"/>` +
          `<path d="M74 214 Q100 206 126 214 L129 234 Q100 242 71 234 Z" fill="#8dbdf0" stroke="${p.line}" ${SW}="2"/>` +
          `<path d="M92 158 L90 182 M108 158 L110 182" stroke="#fff" ${SW}="2.2"/><circle cx="90" cy="184" r="2.6" fill="#fff"/><circle cx="110" cy="184" r="2.6" fill="#fff"/>` +
          `<g transform="translate(118 186) rotate(35)"><path d="M0 -8 C5 -8 5 4 0 12 C-5 4 -5 -8 0 -8 Z" fill="#ff8c2e" stroke="${p.line}" ${SW}="1.5"/><path d="M0 -8 l-3 -5 M0 -8 l3 -5" stroke="#6cb948" ${SW}="2"/></g>`,
        armL: armShape(60, 190, 26, p, '#72a9e0'),
        armR: armShape(144, 180, -52, p, '#72a9e0'),
        hat: `<path d="M84 67 Q80 50 92 57 Q94 42 104 55 Q112 44 114 60 Q120 56 118 66" fill="${p.fur}" stroke="${p.line}" ${SW}="2.3" stroke-linejoin="round"/>`,
        face:
          `<path d="M72 97 Q80 91 88 96 M112 96 Q120 91 128 97" stroke="${p.line}" ${SW}="2.4" fill="none" stroke-linecap="round"/>` +
          `<g transform="rotate(-22 136 118)"><rect x="126" y="114" width="21" height="8" rx="4" fill="#f6c89a" stroke="${p.line}" ${SW}="1.3"/><rect x="133" y="114" width="7" height="8" fill="#eeb07c"/></g>`,
        mouth:
          `<path class="mouth" d="M89 127 Q100 142 111 127 Q100 131 89 127 Z" fill="#a2434a" stroke="${p.line}" ${SW}="2" stroke-linejoin="round"/>` +
          `<rect x="96.5" y="128" width="7" height="5" rx="1" fill="#fff"/>` +
          `<ellipse class="mouth-open" cx="100" cy="134" rx="6" ry="5" fill="#a2434a" stroke="${p.line}" ${SW}="1.4"/>`,
      };
    },

    bun(p) {
      return {
        scale: 'translate(15 38) scale(.85)',
        ears: ear(76, 62, -30, p, 'l', { len: 23, w: 16, tip: '#e6c9a8' }) + ear(124, 62, 30, p, 'r', { len: 23, w: 16 }),
        headMark: `<ellipse cx="79" cy="109" rx="17" ry="15" fill="#e6c9a8"/>`,
        hat: `<g fill="${p.fur}" stroke="${p.line}" ${SW}="2"><circle cx="90" cy="66" r="9"/><circle cx="110" cy="66" r="9"/><circle cx="100" cy="60" r="10"/></g>`,
        eyes: eyes({ big: true }),
        neck: `<g fill="${p.fur}" stroke="${p.line}" ${SW}="2"><circle cx="78" cy="156" r="8"/><circle cx="92" cy="159" r="8"/><circle cx="108" cy="159" r="8"/><circle cx="122" cy="156" r="8"/></g>`,
        armL: armShape(74, 196, -30, p),
        armR: armShape(126, 196, 30, p),
        front:
          `<g transform="rotate(-28 100 196)"><path d="M100 176 C110 176 112 190 100 222 C88 190 90 176 100 176 Z" fill="#ff8c2e" stroke="${p.line}" ${SW}="2"/>` +
          `<path d="M95 188 h6 M96 198 h6 M97 208 h5" stroke="#d9661a" ${SW}="2" stroke-linecap="round"/>` +
          `<path d="M100 176 q-8 -12 -12 -10 M100 176 q0 -14 4 -16 M100 176 q8 -10 12 -8" stroke="#6cb948" ${SW}="3" fill="none" stroke-linecap="round"/></g>` +
          `<ellipse cx="80" cy="200" rx="8" ry="7" fill="${p.fur}" stroke="${p.line}" ${SW}="2"/><ellipse cx="120" cy="200" rx="8" ry="7" fill="${p.fur}" stroke="${p.line}" ${SW}="2"/>`,
        mouth:
          `<path class="mouth" d="M100 126 L100 129 M93 129 Q96.5 133.5 100 129 Q103.5 133.5 107 129" fill="none" stroke="${p.line}" ${SW}="2.2" stroke-linecap="round"/>` +
          `<rect x="97" y="130" width="6" height="4.5" rx="1" fill="#fff" stroke="${p.line}" ${SW}="1"/>` +
          `<g fill="#e7a86b"><circle cx="112" cy="136" r="1.4"/><circle cx="116" cy="132" r="1.1"/></g>` +
          `<ellipse class="mouth-open" cx="100" cy="133" rx="4.8" ry="4.2" fill="#a2434a" stroke="${p.line}" ${SW}="1.4"/>`,
        portraitVB: '22 30 156 150',
      };
    },

    max(p) {
      return {
        ears: ear(78, 47, -20, p, 'l', { len: 34 }) + ear(123, 47, 22, p, 'r', { len: 34 }),
        headMark:
          `<path d="M100 64 Q93 88 100 104 Q107 88 100 64 Z" fill="${p.belly}" opacity=".75"/>` +
          `<ellipse cx="100" cy="127" rx="17" ry="12" fill="${p.belly}"/>`,
        eyes: eyes(),
        face: `<path d="M71 97 Q80 93 88 97 M112 97 Q120 93 129 97" stroke="${p.line}" ${SW}="2.4" fill="none" stroke-linecap="round"/>`,
        outfit: `<path d="M66 168 L134 238" stroke="#6b4a2f" ${SW}="6" stroke-linecap="round"/><rect x="120" y="222" width="26" height="22" rx="6" fill="#c98a55" stroke="${p.line}" ${SW}="2"/><path d="M120 230 H146" stroke="${p.line}" ${SW}="2"/>`,
        neck:
          `<g class="scarf"><path d="M54 150 Q100 172 146 150 L148 168 Q100 190 52 168 Z" fill="#3f9b8f" stroke="${p.line}" ${SW}="2.2" stroke-linejoin="round"/>` +
          `<path d="M70 160 L68 176 M88 166 L87 182 M112 166 L113 182 M130 160 L132 176" stroke="#f3e2c3" ${SW}="4"/>` +
          `<path d="M116 170 L132 170 L138 222 L118 224 Z" fill="#3f9b8f" stroke="${p.line}" ${SW}="2.2" stroke-linejoin="round"/>` +
          `<path d="M120 188 L135 187 M121 204 L136 203" stroke="#f3e2c3" ${SW}="4"/>` +
          `<path d="M120 224 l-1 7 M125 224 v7 M130 223 v7 M135 222 l1 7" stroke="${p.line}" ${SW}="2" stroke-linecap="round"/></g>`,
        mouth:
          `<path class="mouth" d="M100 126 L100 129 M94 129 Q97 132 100 129 Q103 132 106 129" fill="none" stroke="${p.line}" ${SW}="2.2" stroke-linecap="round"/>` +
          `<ellipse class="mouth-open" cx="100" cy="133" rx="4.5" ry="4" fill="#a2434a" stroke="${p.line}" ${SW}="1.4"/>`,
      };
    },

    lisa(p, o) {
      const flower = (x, y, c) =>
        `<g transform="translate(${x} ${y})"><g fill="${c}" stroke="${p.line}" ${SW}="1.3"><circle cx="0" cy="-5" r="4.6"/><circle cx="4.8" cy="-1.5" r="4.6"/><circle cx="3" cy="4.2" r="4.6"/><circle cx="-3" cy="4.2" r="4.6"/><circle cx="-4.8" cy="-1.5" r="4.6"/></g><circle r="3" fill="#fff3c4" stroke="${p.line}" ${SW}="1"/></g>`;
      const crown =
        `<g class="crown"><path d="M64 80 Q100 58 136 80" stroke="#6cb948" ${SW}="3" fill="none"/>` +
        `<ellipse cx="76" cy="72" rx="5" ry="2.6" fill="#8bd35f" transform="rotate(-30 76 72)"/><ellipse cx="124" cy="72" rx="5" ry="2.6" fill="#8bd35f" transform="rotate(30 124 72)"/>` +
        flower(67, 80, '#ff9a3c') + flower(84, 68, '#ffd54f') + flower(100, 64, '#ff8fab') + flower(116, 68, '#ffd54f') + flower(133, 80, '#ff9a3c') +
        `</g>`;
      const partyHat =
        `<g class="party-hat" transform="rotate(-12 100 60)"><path d="M100 8 L124 70 Q100 78 76 70 Z" fill="#ffd54f" stroke="${p.line}" ${SW}="2.3" stroke-linejoin="round"/>` +
        `<path d="M90 36 L110 34 M83 54 L118 52" stroke="#ff8fab" ${SW}="5"/>` +
        `<text x="100" y="63" text-anchor="middle" font-size="15" font-weight="900" fill="#fff" stroke="${p.line}" ${SW}="1" font-family="system-ui,sans-serif">16</text>` +
        `<circle cx="100" cy="8" r="7" fill="#ff8fab" stroke="${p.line}" ${SW}="2"/></g>`;
      return {
        ears: ear(79, 42, -13, p, 'l', { len: 38 }) + ear(121, 42, 13, p, 'r', { len: 38 }),
        outfit:
          `<path d="M60 200 C60 172 76 156 100 156 C124 156 140 172 140 200 L146 238 Q100 252 54 238 Z" fill="#fffaf2" stroke="${p.line}" ${SW}="2"/>` +
          `<g fill="#ff9a3c"><circle cx="92" cy="200" r="2.6"/><circle cx="106" cy="214" r="2.6"/><circle cx="96" cy="230" r="2.6"/><circle cx="104" cy="184" r="2.2"/></g>` +
          `<path d="M56 205 C55 176 70 154 96 154 L88 246 C72 244 57 232 56 205 Z" fill="#ffc94a" stroke="${p.line}" ${SW}="2.2" stroke-linejoin="round"/>` +
          `<path d="M144 205 C145 176 130 154 104 154 L112 246 C128 244 143 232 144 205 Z" fill="#ffc94a" stroke="${p.line}" ${SW}="2.2" stroke-linejoin="round"/>` +
          `<g fill="#fff" stroke="${p.line}" ${SW}="1.2"><circle cx="90" cy="190" r="2.6"/><circle cx="89" cy="210" r="2.6"/></g>` +
          `<path d="M116 186 l-4 -4 a2.6 2.6 0 0 1 4 -3.4 a2.6 2.6 0 0 1 4 3.4 z" fill="#ff6f91"/>`,
        armL: armShape(60, 190, 24, p, '#ffc94a'),
        armR: armShape(140, 190, -24, p, '#ffc94a'),
        eyes: `<g class="eyes">${eye(80, { lash: true, big: true })}${eye(120, { lash: true, big: true })}<path d="M84 115 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z M124 115 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z" fill="#fff"/></g>`,
        cheeks: cheeks('#ff7f9e', 0.55),
        hat: o.partyHat ? partyHat : crown,
      };
    },

    shop(p) {
      const lop = (side) => {
        const x = side === 'l' ? 52 : 148;
        const r = side === 'l' ? 16 : -16;
        return (
          `<g class="ear ear-${side}"><g transform="rotate(${r} ${x} 110)">` +
          `<ellipse cx="${x}" cy="114" rx="13" ry="35" fill="${p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
          `<ellipse cx="${x}" cy="118" rx="6" ry="24" fill="${p.inner}"/></g></g>`
        );
      };
      return {
        ears: lop('l') + lop('r'),
        outfit:
          `<path d="M66 176 H134 L140 238 Q100 250 60 238 Z" fill="#8cc97f" stroke="${p.line}" ${SW}="2.2" stroke-linejoin="round"/>` +
          `<path d="M78 177 L75 240 M92 177 L91 244 M108 177 L109 244 M122 177 L125 240" stroke="#e8f6d9" ${SW}="4"/>` +
          `<path d="M80 176 V160 H120 V176" fill="#8cc97f" stroke="${p.line}" ${SW}="2.2"/>`,
        hat:
          `<path d="M56 86 Q56 54 100 52 Q144 54 144 86 Q100 74 56 86 Z" fill="#9a7048" stroke="${p.line}" ${SW}="2.4" stroke-linejoin="round"/>` +
          `<path d="M60 84 Q100 72 140 84 Q150 92 140 94 Q100 84 60 94 Q50 92 60 84 Z" fill="#7d5835" stroke="${p.line}" ${SW}="2.2"/>` +
          `<circle cx="100" cy="54" r="4" fill="#7d5835" stroke="${p.line}" ${SW}="1.6"/>`,
        face: `<path d="M70 100 Q80 94 90 100 M110 100 Q120 94 130 100" stroke="#fff6ea" ${SW}="5" stroke-linecap="round" fill="none"/>`,
        mouth:
          `<ellipse class="mouth-open" cx="100" cy="136" rx="4.5" ry="3.8" fill="#a2434a" stroke="${p.line}" ${SW}="1.4"/>` +
          `<path d="M100 125 Q88 118 79 127 Q86 136 100 129 Q114 136 121 127 Q112 118 100 125 Z" fill="#fff6ea" stroke="${p.line}" ${SW}="1.8" stroke-linejoin="round"/>`,
      };
    },
  };

  /**
   * Build a bunny SVG.
   * @param {string} id  character id
   * @param {object} o   { portrait, partyHat }
   */
  A.bunny = function (id, o = {}) {
    const p = PAL[id] || PAL.poppy;
    const b = (BUILD[id] || (() => ({})))(p, o);
    const vb = o.portrait ? b.portraitVB || '22 4 156 164' : '0 0 200 262';
    return (
      `<svg class="bunny-svg" viewBox="${vb}" aria-hidden="true" focusable="false">` +
      (o.portrait ? '' : `<ellipse class="shadow" cx="100" cy="253" rx="56" ry="7" fill="rgba(107,63,42,.16)"/>`) +
      `<g class="bunny-all"${b.scale ? ` transform="${b.scale}"` : ''}>` +
      (b.back || '') +
      `<g class="ears">${b.ears || ear(80, 44, -10, p, 'l') + ear(120, 44, 10, p, 'r')}</g>` +
      `<g class="body">` +
      `<ellipse cx="78" cy="247" rx="19" ry="9.5" fill="${p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
      `<ellipse cx="122" cy="247" rx="19" ry="9.5" fill="${p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
      `<path d="${BODY}" fill="${p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
      `<ellipse cx="100" cy="206" rx="27" ry="29" fill="${p.belly}"/>` +
      (b.outfit || '') +
      `</g>` +
      `<g class="arm arm-l">${b.armL || armShape(60, 190, 24, p)}</g>` +
      `<g class="arm arm-r">${b.armR || armShape(140, 190, -24, p)}</g>` +
      (b.neck || '') +
      `<g class="head">` +
      `<path d="${HEAD}" fill="${p.fur}" stroke="${p.line}" ${SW}="2.5"/>` +
      (b.headMark || '') +
      whiskers(p) +
      (b.eyes || eyes()) +
      (b.cheeks || cheeks()) +
      nose(p) +
      (b.mouth || mouth(p)) +
      (b.face || '') +
      (b.hat || '') +
      `</g>` +
      (b.front || '') +
      `</g></svg>`
    );
  };

  /* ================================================================
     ITEM ICONS (64×64, sticker style)
     ================================================================ */
  const st = `stroke="${L}" ${SW}="2.5" stroke-linejoin="round" stroke-linecap="round"`;
  const ICONS = {
    carrot:
      `<g ${st}><path d="M18 22 Q15 12 7 10 Q12 18 16 24Z" fill="#7cc653"/><path d="M20 20 Q21 9 28 4 Q25 14 23 21Z" fill="#8bd35f"/><path d="M17 23 Q9 19 4 23 Q11 26 18 26Z" fill="#6cb948"/>` +
      `<path d="M16 20 C24 14 36 20 44 32 C52 44 58 57 55 59 C52 61 40 54 29 44 C18 34 10 26 16 20Z" fill="#ff8c2e"/>` +
      `<path d="M25 30 l6 -4 M32 39 l6 -4 M40 47 l5 -3" fill="none" stroke="#d9661a" ${SW}="2.2"/></g>`,
    flour:
      `<g ${st}><path d="M14 24 Q9 44 14 57 Q32 63 50 57 Q55 44 50 24 Z" fill="#f6ead3"/>` +
      `<path d="M16 25 Q23 15 21 8 Q32 13 43 8 Q41 15 48 25 Q32 29 16 25Z" fill="#efdcbc"/>` +
      `<path d="M32 55 V34 M32 39 q-6 -2 -7 -7 M32 39 q6 -2 7 -7 M32 46 q-6 -2 -7 -7 M32 46 q6 -2 7 -7" fill="none" stroke="#e0a54a"/></g>`,
    eggs:
      `<g ${st}><ellipse cx="24" cy="37" rx="13" ry="16" fill="#fffaf0"/><ellipse cx="40" cy="41" rx="13" ry="16" fill="#f8e2c3"/></g>` +
      `<ellipse cx="20" cy="31" rx="3" ry="5" fill="#fff"/><ellipse cx="36" cy="35" rx="3" ry="5" fill="#fff" opacity=".8"/>`,
    milk:
      `<g ${st}><path d="M24 9 H40 V17 Q48 23 48 32 V54 Q48 60 42 60 H22 Q16 60 16 54 V32 Q16 23 24 17 Z" fill="#fff"/>` +
      `<path d="M16.5 36 H47.5 V50 H16.5 Z" fill="#8cc8f5" stroke="none"/><rect x="22" y="4" width="20" height="8" rx="3" fill="#5aa7e6"/></g>` +
      `<path d="M32 47.5 l-4.5 -4.5 a2.8 2.8 0 0 1 4.5 -3.6 a2.8 2.8 0 0 1 4.5 3.6 z" fill="#fff"/>`,
    butter:
      `<g ${st}><ellipse cx="32" cy="46" rx="27" ry="10" fill="#bfe3ff"/>` +
      `<path d="M14 42 V30 L40 30 V42 Z" fill="#ffd95c"/><path d="M14 30 L25 23 H51 L40 30 Z" fill="#fff0a8"/><path d="M40 30 L51 23 V35 L40 42 Z" fill="#f5c93e"/></g>`,
    chocolate:
      `<g ${st} transform="rotate(-12 32 32)"><rect x="15" y="10" width="34" height="44" rx="4" fill="#7a4428"/>` +
      `<path d="M15 21 H49 M26 10 V32 M38 10 V32" stroke="#5c311b" ${SW}="2"/>` +
      `<path d="M15 32 H49 V50 Q49 54 45 54 H19 Q15 54 15 50 Z" fill="#e8574f"/>` +
      `<path d="M15 32 L20.5 36 L26 32 L31.5 36 L37 32 L42.5 36 L49 32" fill="none" stroke="#f3c44d" ${SW}="2.5"/></g>`,
    sprinkles:
      `<g ${st}><rect x="15" y="17" width="34" height="42" rx="9" fill="#eaf6ff"/><rect x="13" y="8" width="38" height="11" rx="4" fill="#ff8fab"/></g>` +
      `<g stroke-width="3.2" stroke-linecap="round">` +
      [['#ff6f91', 22, 28, 26, 26], ['#ffd54f', 32, 30, 36, 33], ['#4fc3f7', 41, 27, 39, 31], ['#8bd35f', 22, 40, 25, 44], ['#ff9a3c', 33, 42, 37, 40], ['#b388ff', 40, 47, 43, 44], ['#ff6f91', 26, 51, 30, 52], ['#4fc3f7', 35, 52, 33, 49]]
        .map(([c, a, b2, d, e]) => `<path d="M${a} ${b2} L${d} ${e}" stroke="${c}"/>`)
        .join('') +
      `</g>`,
    candles:
      `<g ${st}><path d="M16 60 V30 H28 V60" fill="#ffb3c7"/><path d="M36 60 V30 H48 V60" fill="#9ad8ff"/>` +
      `<path d="M22 30 V25 M42 30 V25" fill="none" ${SW}="2"/></g>` +
      `<text x="22" y="52" text-anchor="middle" font-size="18" font-weight="900" fill="#fff" stroke="${L}" ${SW}="1" font-family="system-ui,sans-serif">1</text>` +
      `<text x="42" y="52" text-anchor="middle" font-size="18" font-weight="900" fill="#fff" stroke="${L}" ${SW}="1" font-family="system-ui,sans-serif">6</text>` +
      `<g class="flame"><path d="M22 24 Q16 16 22 8 Q28 16 22 24Z" fill="#ffb347" stroke="${L}" ${SW}="1.5"/><path d="M42 24 Q36 16 42 8 Q48 16 42 24Z" fill="#ffb347" stroke="${L}" ${SW}="1.5"/></g>`,
    cups:
      `<g ${st}><path d="M20 18 H56 L51 42 H25 Z" fill="#fff0a0"/><path d="M8 28 H46 L40 58 H14 Z" fill="#ffb3c7"/></g>` +
      `<path d="M14 28 L19 58 M21 28 L24 58 M27 28 V58 M33 28 L32 58 M40 28 L36 58" stroke="#e58aa4" ${SW}="2"/>`,
    chips:
      `<g ${st}><path d="M14 14 H50 L47 59 H17 Z" fill="#f5c16c"/><path d="M14 14 L18 7 H46 L50 14" fill="#f0ad4e"/><circle cx="32" cy="38" r="12" fill="#fff5e0" ${SW}="2"/></g>` +
      `<g fill="#6b3a1e"><path d="M26 36 q2 -5 4 0 q-2 2 -4 0z"/><path d="M33 33 q2 -5 4 0 q-2 2 -4 0z"/><path d="M30 42 q2 -5 4 0 q-2 2 -4 0z"/><path d="M36 40 q2 -5 4 0 q-2 2 -4 0z"/></g>`,
    balloons:
      `<path d="M20 38 Q24 50 32 61 M44 36 Q40 50 32 61 M32 31 V61" stroke="${L}" ${SW}="1.6" fill="none"/>` +
      `<g ${st}><ellipse cx="19" cy="25" rx="11" ry="14" fill="#ff9a3c"/><ellipse cx="45" cy="23" rx="11" ry="14" fill="#ff8fab"/><ellipse cx="32" cy="17" rx="11" ry="14" fill="#ffd54f"/></g>` +
      `<g fill="#fff" opacity=".6"><ellipse cx="15" cy="20" rx="2.5" ry="4"/><ellipse cx="41" cy="18" rx="2.5" ry="4"/><ellipse cx="28" cy="12" rx="2.5" ry="4"/></g>`,
    banner:
      `<path d="M3 14 Q32 30 61 14" fill="none" stroke="${L}" ${SW}="2"/>` +
      `<g ${st}><path d="M5 15 L15 18.5 L9 34Z" fill="#ff9a3c"/><path d="M18 19.5 L28 21.5 L22 38Z" fill="#ffd54f"/><path d="M31 22 L41 21 L36 38Z" fill="#ff8fab"/><path d="M44 20 L54 17 L50 34Z" fill="#8ed0a8"/></g>`,
    flowers:
      `<g ${st}><path d="M32 42 V24 M26 42 Q22 32 17 26 M38 42 Q43 32 47 24" fill="none" stroke="#5aa84a"/><path d="M21 42 H43 L40 60 H24 Z" fill="#8fd0e8"/></g>` +
      [[17, 22, '#ff9a3c'], [47, 21, '#ff8fab'], [32, 17, '#ffd54f']]
        .map(
          ([x, y, c]) =>
            `<g transform="translate(${x} ${y})"><g fill="${c}" stroke="${L}" ${SW}="1.6"><circle cy="-5" r="4.5"/><circle cx="5" cy="-1" r="4.5"/><circle cx="3" cy="5" r="4.5"/><circle cx="-3" cy="5" r="4.5"/><circle cx="-5" cy="-1" r="4.5"/></g><circle r="3" fill="#fff3c4" stroke="${L}" ${SW}="1.2"/></g>`
        )
        .join(''),
    hats:
      `<g ${st}><path d="M32 8 L51 55 Q32 62 13 55 Z" fill="#ffd54f"/></g>` +
      `<path d="M26 24 L39 22 M20 40 L45 37" stroke="#ff8fab" ${SW}="5" stroke-linecap="round"/>` +
      `<g fill="#4fc3f7"><circle cx="30" cy="32" r="2.2"/><circle cx="38" cy="47" r="2.2"/><circle cx="24" cy="50" r="2.2"/></g>` +
      `<circle cx="32" cy="8" r="6" fill="#ff8fab" stroke="${L}" ${SW}="2.3"/>`,
    confetti:
      `<g ${st}><path d="M8 56 L24 30 L35 44 Z" fill="#ff9a3c"/><path d="M14 47 L28 38" stroke="#ffd54f" ${SW}="3"/></g>` +
      `<g><rect x="36" y="14" width="6" height="4" rx="1" fill="#ff8fab" transform="rotate(30 39 16)"/><rect x="46" y="26" width="6" height="4" rx="1" fill="#4fc3f7" transform="rotate(-20 49 28)"/>` +
      `<circle cx="30" cy="18" r="3" fill="#8bd35f"/><circle cx="52" cy="40" r="3" fill="#ffd54f"/><rect x="40" y="4" width="5" height="4" rx="1" fill="#b388ff" transform="rotate(15 42 6)"/><circle cx="22" cy="10" r="2.4" fill="#ff6f91"/><rect x="54" y="14" width="5" height="4" rx="1" fill="#ff9a3c"/></g>`,
    gift:
      `<g ${st}><rect x="12" y="29" width="40" height="30" rx="3" fill="#ff8fab"/><rect x="9" y="21" width="46" height="10" rx="3" fill="#ffadc2"/>` +
      `<rect x="28" y="21" width="8" height="38" fill="#ffd54f"/><path d="M32 21 Q18 6 15 16 Q19 23 32 21 Q46 6 49 16 Q45 23 32 21Z" fill="#ffd54f"/></g>`,
    bows:
      `<g ${st}><path d="M30 33 L22 54 L28 51 L32 36 M34 33 L42 54 L36 51 L32 36" fill="#ff7aa8"/>` +
      `<path d="M32 31 Q14 14 10 26 Q8 39 32 32 Q56 39 54 26 Q50 14 32 31Z" fill="#ff7aa8"/><circle cx="32" cy="31" r="5.5" fill="#ff5c93"/></g>`,
    lights:
      `<path d="M3 14 Q17 32 32 18 Q47 4 61 22" fill="none" stroke="#5a8a3a" ${SW}="2.2"/>` +
      [[10, 22, '#ffd54f'], [22, 26, '#ff8fab'], [33, 17, '#ff9a3c'], [45, 11, '#9ad8ff'], [56, 17, '#8bd35f']]
        .map(([x, y, c]) => `<circle cx="${x}" cy="${y + 7}" r="8" fill="${c}" opacity=".25"/><ellipse cx="${x}" cy="${y + 6}" rx="4" ry="6" fill="${c}" stroke="${L}" ${SW}="1.8"/>`)
        .join(''),
    table:
      `<g ${st}><ellipse cx="32" cy="24" rx="27" ry="9" fill="#fff"/><path d="M5 24 Q5 46 10 50 Q32 58 54 50 Q59 46 59 24 Q32 34 5 24Z" fill="#fff6e8"/></g>` +
      `<path d="M10 49 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0" fill="none" stroke="#ffb3c7" ${SW}="2.5"/>`,
    chairs:
      `<g ${st}><rect x="18" y="6" width="28" height="26" rx="8" fill="#e8a868"/><rect x="13" y="31" width="38" height="9" rx="4" fill="#ffb3c7"/>` +
      `<path d="M18 40 V58 M46 40 V58" fill="none" ${SW}="4"/></g>`,
    cake:
      `<g ${st}><ellipse cx="32" cy="54" rx="28" ry="6" fill="#fff"/><path d="M12 30 V50 Q32 58 52 50 V30" fill="#8b5a3c"/><ellipse cx="32" cy="30" rx="20" ry="7" fill="#ffb3c7"/></g>` +
      `<path d="M13 32 q3 8 6 1 q3 8 6 1 q3 8 6 1 q3 8 6 1 q3 8 6 1 q3 6 6 0" fill="#ffb3c7" stroke="${L}" ${SW}="1.8"/>` +
      `<rect x="27" y="14" width="4" height="14" rx="1" fill="#9ad8ff" stroke="${L}" ${SW}="1.5"/><rect x="34" y="14" width="4" height="14" rx="1" fill="#ffd54f" stroke="${L}" ${SW}="1.5"/>` +
      `<path d="M29 13 Q26 8 29 4 Q32 8 29 13Z M36 13 Q33 8 36 4 Q39 8 36 13Z" fill="#ffb347"/>`,
    muffin:
      `<g ${st}><path d="M14 34 H50 L45 58 H19 Z" fill="#ffb3c7"/><path d="M11 36 Q10 16 32 14 Q54 16 53 36 Z" fill="#b5764a"/></g>` +
      `<g fill="#5c311b"><circle cx="24" cy="26" r="2"/><circle cx="35" cy="22" r="2"/><circle cx="42" cy="30" r="2"/><circle cx="30" cy="31" r="2"/></g><circle cx="32" cy="12" r="5" fill="#ff5c7a" stroke="${L}" ${SW}="2"/>`,
  };

  A.icon = (id, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${ICONS[id] || ICONS.gift}</svg>`;
  A.carrotIcon = (cls = '') => A.icon('carrot', cls);

  /* ================================================================
     CAKE & MUFFINS
     ================================================================ */
  const FROST = { chocolate: '#7b4a30', vanilla: '#fff4dc', strawberry: '#ffb3c7' };
  A.FROST = FROST;
  const SPRINKLE_COLORS = ['#ff6f91', '#ffd54f', '#4fc3f7', '#8bd35f', '#ff9a3c', '#b388ff', '#ffffff'];

  function seeded(n) {
    let s = n * 9301 + 49297;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  /** Lisa's birthday cake. o: { frosting, sprinkles (0-20), candles ('16'|'61'|null), lit, stage } */
  A.cake = function (o = {}) {
    const frost = FROST[o.frosting] || FROST.vanilla;
    const frostEdge = o.frosting === 'chocolate' ? '#5a3320' : o.frosting === 'strawberry' ? '#f28aa8' : '#f0dcb5';
    const sponge = '#8b5a3c';
    const n = Math.round((o.sprinkles || 0) * 6);
    const rnd = seeded(7);
    let spr = '';
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd());
      const x = 100 + Math.cos(a) * r * 64;
      const y = 84 + Math.sin(a) * r * 15;
      const rot = Math.floor(rnd() * 180);
      spr += `<rect x="${(x - 3).toFixed(1)}" y="${(y - 1.2).toFixed(1)}" width="6" height="2.4" rx="1.2" fill="${SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    const candle = (ch, x) =>
      `<g class="candle"><text x="${x}" y="80" text-anchor="middle" font-size="46" font-weight="900" fill="#ffe082" stroke="${L}" ${SW}="2.5" paint-order="stroke" font-family="ui-rounded,system-ui,sans-serif">${ch}</text>` +
      `<path d="M${x} 36 V28" stroke="${L}" ${SW}="2"/>` +
      `<g class="flame${o.lit ? '' : ' out'}"><path d="M${x} 29 Q${x - 7} 18 ${x} 6 Q${x + 7} 18 ${x} 29Z" fill="#ffb347" stroke="#e8801e" ${SW}="1.5"/><path d="M${x} 26 Q${x - 3} 19 ${x} 13 Q${x + 3} 19 ${x} 26Z" fill="#fff3a0"/></g>` +
      `<g class="smoke"><path d="M${x} 26 q-6 -8 0 -14 q6 -6 0 -14" stroke="#c9c1bb" ${SW}="3" fill="none" stroke-linecap="round"/></g></g>`;
    const candles = o.candles ? candle(o.candles[0], 82) + candle(o.candles[1], 118) : '';
    return (
      `<svg class="cake-svg" viewBox="0 0 200 200" aria-hidden="true">` +
      `<ellipse cx="100" cy="176" rx="94" ry="16" fill="#fff" stroke="${L}" ${SW}="3"/>` +
      `<ellipse cx="100" cy="173" rx="78" ry="10" fill="#f3ece4"/>` +
      `<path d="M30 84 V156 Q100 182 170 156 V84" fill="${sponge}" stroke="${L}" ${SW}="3"/>` +
      `<path d="M30 122 Q100 142 170 122" stroke="#ffe4b8" ${SW}="6" fill="none" opacity=".85"/>` +
      (o.frosting && o.frostLevel != null && o.frostLevel < 3
        ? `<ellipse cx="100" cy="84" rx="70" ry="19" fill="#a8704c" stroke="${L}" ${SW}="3"/>` +
          (o.frostLevel > 0
            ? `<ellipse cx="${o.frostLevel === 1 ? 84 : 100}" cy="${o.frostLevel === 1 ? 82 : 84}" rx="${o.frostLevel === 1 ? 36 : 62}" ry="${o.frostLevel === 1 ? 10 : 16}" fill="${frost}" stroke="${frostEdge}" ${SW}="2"/>`
            : '')
        : o.frosting
        ? `<path d="M30 84 V100 q6 14 12 2 q6 18 12 4 q6 12 12 0 q6 18 12 4 q6 12 12 0 q6 18 12 4 q6 12 12 0 q6 16 12 2 q6 14 12 2 q6 12 12 0 q6 8 10 -2 V84 Z" fill="${frost}" stroke="${frostEdge}" ${SW}="2"/>` +
          `<ellipse cx="100" cy="84" rx="70" ry="19" fill="${frost}" stroke="${L}" ${SW}="3"/>` +
          `<ellipse cx="80" cy="79" rx="26" ry="5" fill="#fff" opacity=".25"/>`
        : `<ellipse cx="100" cy="84" rx="70" ry="19" fill="#a8704c" stroke="${L}" ${SW}="3"/>`) +
      spr +
      candles +
      `</svg>`
    );
  };

  /** One muffin. o: { state:'cup'|'filled'|'baked', batter, chips, topping } */
  A.muffin = function (o = {}) {
    const batter = { vanilla: '#f3cf8e', chocolate: '#8b5a3c', carrot: '#f0a35a' }[o.batter] || '#f3cf8e';
    const baked = { vanilla: '#e2ae62', chocolate: '#6e4228', carrot: '#d9843c' }[o.batter] || '#e2ae62';
    let top = '';
    if (o.state === 'filled') top = `<ellipse cx="50" cy="52" rx="30" ry="8" fill="${batter}" stroke="${L}" ${SW}="2.2"/>`;
    if (o.state === 'baked') top = `<path d="M16 56 Q14 20 50 18 Q86 20 84 56 Z" fill="${baked}" stroke="${L}" ${SW}="2.5"/><path d="M28 32 Q40 24 52 26" stroke="#fff" opacity=".35" ${SW}="4" fill="none" stroke-linecap="round"/>`;
    let chips = '';
    if (o.chips && o.state !== 'cup') {
      const pts = o.state === 'baked' ? [[34, 36], [52, 28], [64, 40], [44, 46], [58, 50], [30, 50]] : [[36, 50], [50, 48], [62, 52], [44, 54]];
      chips = pts.slice(0, Math.min(pts.length, o.chips * 2)).map(([x, y]) => `<path d="M${x - 3} ${y + 2} q3 -7 6 0 q-3 2.5 -6 0z" fill="#4a2616"/>`).join('');
    }
    const tops = {
      strawberry: `<g transform="translate(50 18)"><path d="M-9 -2 Q0 -6 9 -2 Q8 12 0 16 Q-8 12 -9 -2Z" fill="#ff5c7a" stroke="${L}" ${SW}="2"/><path d="M-6 -3 L0 -9 L6 -3" fill="#6cb948" stroke="${L}" ${SW}="1.6"/><g fill="#ffe082"><circle cx="-3" cy="4" r="1"/><circle cx="3" cy="7" r="1"/><circle cx="0" cy="11" r="1"/></g></g>`,
      carrot: `<g transform="translate(50 20) rotate(20)"><path d="M0 -8 C6 -8 6 4 0 16 C-6 4 -6 -8 0 -8 Z" fill="#ff8c2e" stroke="${L}" ${SW}="2"/><path d="M0 -8 l-4 -7 M0 -8 l0 -8 M0 -8 l4 -7" stroke="#6cb948" ${SW}="2.6" stroke-linecap="round"/></g>`,
      heart: `<path d="M50 30 l-10 -10 a6 6 0 0 1 10 -8 a6 6 0 0 1 10 8 z" fill="#ff6f91" stroke="${L}" ${SW}="2"/>`,
      star: `<path d="M50 6 L54 16 L65 17 L57 24 L59 35 L50 29 L41 35 L43 24 L35 17 L46 16 Z" fill="#ffd54f" stroke="${L}" ${SW}="2" stroke-linejoin="round"/>`,
      swirl: `<path d="M30 30 Q30 14 50 14 Q70 14 70 30 Q60 24 50 28 Q40 24 30 30Z" fill="#fff4dc" stroke="${L}" ${SW}="2"/><path d="M36 22 Q50 4 64 22 Q56 16 50 18 Q44 16 36 22Z" fill="#fff4dc" stroke="${L}" ${SW}="2"/>`,
    };
    return (
      `<svg class="muffin-svg" viewBox="0 0 100 100" aria-hidden="true">` +
      top +
      chips +
      `<path d="M18 54 H82 L74 94 H26 Z" fill="${o.cup || '#ffb3c7'}" stroke="${L}" ${SW}="2.5" stroke-linejoin="round"/>` +
      `<path d="M28 54 L33 94 M40 54 L42 94 M52 54 V94 M64 54 L60 94 M74 54 L68 94" stroke="rgba(107,63,42,.25)" ${SW}="2"/>` +
      (o.topping && o.state === 'baked' ? tops[o.topping] || '' : '') +
      `</svg>`
    );
  };

  /* ================================================================
     SCENE PROPS
     ================================================================ */
  A.bowl = (o = {}) =>
    `<svg class="bowl-svg" viewBox="0 0 240 170" aria-hidden="true">` +
    `<ellipse cx="120" cy="60" rx="104" ry="26" fill="#d6ecf7" stroke="${L}" ${SW}="3"/>` +
    `<g class="bowl-contents">${o.contents || ''}</g>` +
    `<path d="M16 60 Q20 156 120 162 Q220 156 224 60 Q120 96 16 60 Z" fill="#8fc7e8" stroke="${L}" ${SW}="3" stroke-linejoin="round"/>` +
    `<path d="M40 88 Q60 132 110 140" stroke="#fff" ${SW}="6" opacity=".45" fill="none" stroke-linecap="round"/>` +
    `<path d="M16 60 Q120 96 224 60" stroke="${L}" ${SW}="3" fill="none"/>` +
    `<g fill="#fff" opacity=".7"><circle cx="160" cy="118" r="4"/><circle cx="176" cy="108" r="3"/></g>` +
    `</svg>`;

  A.stationBowl = () => {
    const whisk =
      `<g transform="rotate(24 170 40)"><rect x="166" y="-6" width="8" height="54" rx="4" fill="#d9965c" stroke="${L}" ${SW}="2.5"/>` +
      `<path d="M170 -6 C156 -24 158 -48 170 -54 C182 -48 184 -24 170 -6 M170 -6 C163 -24 164 -44 170 -54 M170 -6 C177 -24 176 -44 170 -54" stroke="#8fa0ad" ${SW}="3" fill="none"/></g>`;
    return (
      `<svg viewBox="0 -64 240 240" aria-hidden="true">` +
      `<ellipse cx="120" cy="164" rx="104" ry="9" fill="rgba(107,63,42,.18)"/>` +
      A.bowl({ contents: whisk }).replace(/<\/?svg[^>]*>/g, '') +
      `<g transform="translate(26 150)"><ellipse cx="0" cy="-14" rx="13" ry="16" fill="#fffaf0" stroke="${L}" ${SW}="2.5"/></g>` +
      `</svg>`
    );
  };

  A.stationTray = (muffins) => {
    let s = `<svg viewBox="0 0 220 150" aria-hidden="true"><ellipse cx="110" cy="140" rx="100" ry="9" fill="rgba(107,63,42,.18)"/>` +
      `<rect x="10" y="70" width="200" height="64" rx="16" fill="#b9c3cc" stroke="${L}" ${SW}="3"/>` +
      `<rect x="18" y="76" width="184" height="10" rx="5" fill="#dfe6ec"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 22 + (i % 3) * 62;
      const y = i < 3 ? 34 : 64;
      s += `<g transform="translate(${x} ${y}) scale(.56)">${A.muffin(muffins ? muffins[i] : { state: 'cup' }).replace(/<\/?svg[^>]*>/g, '')}</g>`;
    }
    return s + `</svg>`;
  };

  A.cakeDome = (cakeSvgInner) =>
    `<svg viewBox="0 0 200 200" aria-hidden="true">${cakeSvgInner}` +
    `<path d="M14 170 Q10 40 100 30 Q190 40 186 170" fill="rgba(220,240,255,.28)" stroke="#9fc6dd" ${SW}="4"/>` +
    `<path d="M40 150 Q36 70 90 50" stroke="#fff" ${SW}="7" opacity=".6" fill="none" stroke-linecap="round"/>` +
    `<circle cx="100" cy="26" r="9" fill="#d6ecf7" stroke="#9fc6dd" ${SW}="4"/></svg>`;

  A.oven = () =>
    `<svg class="oven-svg" viewBox="0 0 220 220" aria-hidden="true">` +
    `<rect x="8" y="8" width="204" height="204" rx="22" fill="#ffb86b" stroke="${L}" ${SW}="4"/>` +
    `<rect x="8" y="8" width="204" height="46" rx="22" fill="#ff9f45" stroke="${L}" ${SW}="4"/>` +
    `<g class="oven-dials"><circle cx="46" cy="31" r="11" fill="#fff5e6" stroke="${L}" ${SW}="3"/><circle class="oven-dial" cx="84" cy="31" r="11" fill="#fff5e6" stroke="${L}" ${SW}="3"/><path class="dial-mark" d="M84 31 V22" stroke="${L}" ${SW}="3" stroke-linecap="round"/><path d="M46 31 V22" stroke="${L}" ${SW}="3" stroke-linecap="round"/></g>` +
    `<rect class="oven-timer" x="118" y="20" width="76" height="24" rx="8" fill="#5b3a2a" stroke="${L}" ${SW}="3"/>` +
    `<text class="oven-timer-text" x="156" y="38" text-anchor="middle" font-size="17" font-weight="800" fill="#ffd54f" font-family="ui-monospace,monospace">--:--</text>` +
    `<rect x="26" y="70" width="168" height="124" rx="16" fill="#8a5a3c" stroke="${L}" ${SW}="4"/>` +
    `<rect class="oven-window" x="44" y="88" width="132" height="84" rx="12" fill="#3d2418" stroke="${L}" ${SW}="3"/>` +
    `<rect class="oven-glow" x="44" y="88" width="132" height="84" rx="12" fill="#ff9a3c" opacity="0"/>` +
    `<g class="oven-inside"></g>` +
    `<path d="M56 96 L76 96" stroke="#fff" ${SW}="4" opacity=".35" stroke-linecap="round"/>` +
    `<rect x="60" y="74" width="100" height="10" rx="5" fill="#e0e0e0" stroke="${L}" ${SW}="2.5"/>` +
    `</svg>`;

  A.tin = (fill = 0, color = '#8b5a3c') =>
    `<svg class="tin-svg" viewBox="0 0 200 110" aria-hidden="true">` +
    `<ellipse cx="100" cy="34" rx="84" ry="18" fill="#cfd8df" stroke="${L}" ${SW}="3"/>` +
    (fill > 0 ? `<ellipse cx="100" cy="${40 - fill * 6}" rx="${70 + fill * 10}" ry="${13 + fill * 3}" fill="${color}"/>` : '') +
    `<path d="M16 34 V80 Q100 104 184 80 V34 Q100 60 16 34 Z" fill="#b9c3cc" stroke="${L}" ${SW}="3" stroke-linejoin="round"/>` +
    `<path d="M30 52 Q40 84 90 88" stroke="#fff" ${SW}="5" opacity=".5" fill="none" stroke-linecap="round"/>` +
    `</svg>`;

  /* ----- garden ----- */
  A.tree = () =>
    `<svg viewBox="0 0 300 440" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
    `<path d="M126 440 C132 360 128 300 110 250 L140 240 L150 200 L166 244 L196 256 C176 300 170 360 178 440 Z" fill="#a8703f" stroke="${L}" ${SW}="4" stroke-linejoin="round"/>` +
    `<path d="M140 400 Q146 340 140 300 M160 380 Q164 340 158 310" stroke="#8a5a30" ${SW}="4" fill="none" stroke-linecap="round"/>` +
    `<g class="foliage">` +
    `<g fill="#86c85e" stroke="${L}" ${SW}="4"><circle cx="80" cy="170" r="66"/><circle cx="220" cy="170" r="66"/><circle cx="150" cy="110" r="84"/><circle cx="110" cy="220" r="58"/><circle cx="196" cy="222" r="58"/></g>` +
    `<g fill="#9dd873"><circle cx="80" cy="170" r="62"/><circle cx="220" cy="170" r="62"/><circle cx="150" cy="110" r="80"/><circle cx="110" cy="220" r="54"/><circle cx="196" cy="222" r="54"/></g>` +
    `<g fill="#b4e38c" opacity=".9"><circle cx="120" cy="80" r="34"/><circle cx="70" cy="150" r="24"/><circle cx="200" cy="140" r="28"/></g>` +
    `<g fill="#ffd1dc" stroke="${L}" ${SW}="1.5"><circle cx="96" cy="120" r="6"/><circle cx="180" cy="90" r="6"/><circle cx="240" cy="200" r="6"/><circle cx="66" cy="210" r="6"/><circle cx="150" cy="200" r="6"/></g>` +
    `<g class="tree-carrot" transform="translate(200 104) rotate(160)"><path d="M0 -12 C8 -12 8 6 0 22 C-8 6 -8 -12 0 -12 Z" fill="#ff8c2e" stroke="${L}" ${SW}="3"/></g>` +
    `</g></svg>`;

  A.bush = (v = 0) => {
    const g = ['#7cc45a', '#8ccf64', '#79bf57'][v % 3];
    const fl = ['#ff8fab', '#ffd54f', '#fff'][v % 3];
    return (
      `<svg viewBox="0 0 220 150" aria-hidden="true" preserveAspectRatio="xMidYMax meet"><g class="bush-leaves">` +
      `<g fill="${g}" stroke="${L}" ${SW}="4"><circle cx="54" cy="96" r="46"/><circle cx="166" cy="96" r="46"/><circle cx="110" cy="70" r="58"/><rect x="30" y="96" width="160" height="50" rx="24"/></g>` +
      `<g fill="${g}"><circle cx="54" cy="96" r="42"/><circle cx="166" cy="96" r="42"/><circle cx="110" cy="70" r="54"/><rect x="34" y="100" width="152" height="42" rx="20"/></g>` +
      `<g fill="#fff" opacity=".22"><circle cx="90" cy="50" r="18"/><circle cx="150" cy="80" r="12"/></g>` +
      `<g fill="${fl}" stroke="${L}" ${SW}="1.6"><circle cx="70" cy="80" r="5"/><circle cx="130" cy="52" r="5"/><circle cx="170" cy="110" r="5"/><circle cx="96" cy="112" r="5"/></g>` +
      `</g></svg>`
    );
  };

  A.carrotSprout = () =>
    `<svg viewBox="0 0 80 90" aria-hidden="true">` +
    `<g class="sprout-carrot"><path d="M26 58 C28 40 52 40 54 58 C52 76 44 88 40 90 C36 88 28 76 26 58Z" fill="#ff8c2e" stroke="${L}" ${SW}="3"/>` +
    `<g fill="#7cc653" stroke="${L}" ${SW}="3"><ellipse cx="29" cy="30" rx="7" ry="18" transform="rotate(-32 29 30)"/><ellipse cx="55" cy="30" rx="7" ry="18" transform="rotate(32 55 30)"/><ellipse cx="42" cy="24" rx="7.5" ry="21" fill="#8bd35f"/></g></g>` +
    `<path d="M4 66 Q40 52 76 66 Q76 86 40 88 Q4 86 4 66Z" fill="#b07a4a" stroke="${L}" ${SW}="3"/>` +
    `<g fill="#8f5f36"><circle cx="20" cy="72" r="3"/><circle cx="56" cy="76" r="3"/><circle cx="40" cy="80" r="2.4"/></g></svg>`;

  A.grassTuft = () =>
    `<svg viewBox="0 0 100 70" aria-hidden="true"><path d="M6 70 Q14 30 22 12 Q26 40 32 70 Q36 24 48 4 Q50 40 54 70 Q62 30 74 14 Q74 44 78 70 Q86 40 96 30 Q92 52 94 70 Z" fill="#8cd064" stroke="${L}" ${SW}="3" stroke-linejoin="round"/></svg>`;

  A.bench = () =>
    `<svg viewBox="0 0 260 130" aria-hidden="true">` +
    `<g fill="#c98a55" stroke="${L}" ${SW}="4" stroke-linejoin="round">` +
    `<rect x="20" y="10" width="220" height="22" rx="8"/><rect x="20" y="40" width="220" height="22" rx="8"/>` +
    `<path d="M40 62 V122 M220 62 V122" ${SW}="10"/><rect x="10" y="70" width="240" height="20" rx="8" fill="#b67746"/>` +
    `</g><path d="M40 62 V122 M220 62 V122" stroke="#b67746" ${SW}="5"/></svg>`;

  A.cloud = () =>
    `<svg viewBox="0 0 200 90" aria-hidden="true"><g fill="#fff"><circle cx="50" cy="56" r="30"/><circle cx="92" cy="40" r="38"/><circle cx="140" cy="54" r="30"/><rect x="40" y="54" width="120" height="32" rx="16"/></g></svg>`;

  A.butterfly = (c = '#ff8fab') =>
    `<svg viewBox="0 0 60 50" aria-hidden="true"><g class="wing wing-l"><ellipse cx="18" cy="18" rx="15" ry="13" fill="${c}" stroke="${L}" ${SW}="2.5"/><ellipse cx="20" cy="36" rx="10" ry="9" fill="${c}" stroke="${L}" ${SW}="2.5"/></g>` +
    `<g class="wing wing-r"><ellipse cx="42" cy="18" rx="15" ry="13" fill="${c}" stroke="${L}" ${SW}="2.5"/><ellipse cx="40" cy="36" rx="10" ry="9" fill="${c}" stroke="${L}" ${SW}="2.5"/></g>` +
    `<rect x="27" y="12" width="6" height="30" rx="3" fill="${L}"/></svg>`;

  /* ----- shop ----- */
  A.counter = () =>
    `<svg viewBox="0 0 420 220" preserveAspectRatio="none" aria-hidden="true">` +
    `<rect x="10" y="40" width="400" height="176" rx="12" fill="#d98f4e" stroke="${L}" ${SW}="4"/>` +
    `<rect x="2" y="24" width="416" height="28" rx="10" fill="#f0b070" stroke="${L}" ${SW}="4"/>` +
    `<g fill="#e6a060" stroke="${L}" ${SW}="3"><rect x="34" y="70" width="104" height="128" rx="10"/><rect x="158" y="70" width="104" height="128" rx="10"/><rect x="282" y="70" width="104" height="128" rx="10"/></g>` +
    `<g transform="translate(210 134)"><circle r="34" fill="#fff4e0" stroke="${L}" ${SW}="3"/>` +
    `<path d="M-6 -14 C6 -14 8 0 0 22 C-8 0 -18 -14 -6 -14Z" fill="#ff8c2e" stroke="${L}" ${SW}="2.5" transform="rotate(20)"/></g>` +
    `</svg>`;

  A.register = () =>
    `<svg viewBox="0 0 140 120" aria-hidden="true">` +
    `<path d="M14 116 L24 50 H116 L126 116 Z" fill="#ff9f45" stroke="${L}" ${SW}="4" stroke-linejoin="round"/>` +
    `<rect x="36" y="12" width="68" height="36" rx="8" fill="#5b3a2a" stroke="${L}" ${SW}="4"/>` +
    `<text x="70" y="37" text-anchor="middle" font-size="18" font-weight="800" fill="#ffd54f" font-family="ui-monospace,monospace">🥕🥕</text>` +
    `<g fill="#fff4e0" stroke="${L}" ${SW}="2.5"><rect x="36" y="62" width="18" height="12" rx="3"/><rect x="61" y="62" width="18" height="12" rx="3"/><rect x="86" y="62" width="18" height="12" rx="3"/><rect x="36" y="82" width="18" height="12" rx="3"/><rect x="61" y="82" width="18" height="12" rx="3"/><rect x="86" y="82" width="18" height="12" rx="3"/></g>` +
    `</svg>`;

  A.bell = () =>
    `<svg viewBox="0 0 80 70" aria-hidden="true"><path d="M12 56 Q12 18 40 16 Q68 18 68 56 Z" fill="#ffd54f" stroke="${L}" ${SW}="4"/><rect x="4" y="54" width="72" height="12" rx="6" fill="#c98a55" stroke="${L}" ${SW}="4"/><circle cx="40" cy="12" r="6" fill="#ffd54f" stroke="${L}" ${SW}="3"/><path d="M26 30 Q30 24 36 22" stroke="#fff" ${SW}="4" opacity=".6" fill="none" stroke-linecap="round"/></svg>`;

  /* ----- party room ----- */
  A.window = (curtains = true) =>
    `<svg viewBox="0 0 300 420" aria-hidden="true" preserveAspectRatio="xMidYMin meet">` +
    `<rect x="40" y="20" width="220" height="230" rx="16" fill="#f6c27f" stroke="${L}" ${SW}="5"/>` +
    `<rect x="54" y="34" width="192" height="202" rx="10" fill="#bfe6ff" stroke="${L}" ${SW}="4"/>` +
    `<path d="M54 180 Q110 150 160 172 T246 164 V236 H54Z" fill="#b8df8c"/>` +
    `<circle cx="196" cy="84" r="24" fill="#ffd54f"/><ellipse cx="100" cy="76" rx="30" ry="10" fill="#fff"/>` +
    `<path d="M150 34 V236 M54 132 H246" stroke="${L}" ${SW}="6"/>` +
    `<rect x="30" y="244" width="240" height="18" rx="8" fill="#f0a960" stroke="${L}" ${SW}="4"/>` +
    (curtains
      ? `<path d="M20 6 H280" stroke="#a8703f" ${SW}="8" stroke-linecap="round"/>` +
        `<path d="M22 8 Q70 4 106 8 Q86 140 100 250 Q96 330 108 414 Q60 420 22 414 Z" fill="#ffb07c" stroke="${L}" ${SW}="4" stroke-linejoin="round"/>` +
        `<path d="M278 8 Q230 4 194 8 Q214 140 200 250 Q204 330 192 414 Q240 420 278 414 Z" fill="#ffb07c" stroke="${L}" ${SW}="4" stroke-linejoin="round"/>` +
        `<path d="M44 20 Q46 200 40 410 M70 16 Q76 200 68 410 M256 20 Q254 200 260 410 M230 16 Q224 200 232 410" stroke="#f0915a" ${SW}="4" fill="none"/>` +
        `<path d="M96 242 Q70 250 46 238 M204 242 Q230 250 254 238" stroke="#ff8fab" ${SW}="7" fill="none" stroke-linecap="round"/>`
      : '') +
    `</svg>`;

  A.door = () =>
    `<svg viewBox="0 0 200 400" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
    `<rect x="6" y="6" width="188" height="394" rx="14" fill="#e8a868" stroke="${L}" ${SW}="5"/>` +
    `<rect class="door-light" x="22" y="22" width="156" height="378" rx="8" fill="#fff4c9"/>` +
    `<g class="door-panel"><rect x="22" y="22" width="156" height="378" rx="8" fill="#c97a42" stroke="${L}" ${SW}="4"/>` +
    `<rect x="42" y="46" width="116" height="130" rx="10" fill="#d98f52" stroke="${L}" ${SW}="3"/><rect x="42" y="210" width="116" height="160" rx="10" fill="#d98f52" stroke="${L}" ${SW}="3"/>` +
    `<circle cx="154" cy="206" r="10" fill="#ffd54f" stroke="${L}" ${SW}="3"/>` +
    `<path d="M76 100 l-12 -12 a8 8 0 0 1 12 -10 a8 8 0 0 1 12 10 z" fill="#ff8fab" stroke="${L}" ${SW}="2"/></g>` +
    `</svg>`;

  A.armchair = () =>
    `<svg viewBox="0 0 260 220" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
    `<path d="M40 30 Q40 6 70 6 H190 Q220 6 220 30 V140 H40 Z" fill="#ff9f7a" stroke="${L}" ${SW}="5" stroke-linejoin="round"/>` +
    `<path d="M70 30 V130 M130 26 V130 M190 30 V130" stroke="#f08462" ${SW}="4"/>` +
    `<rect x="44" y="120" width="172" height="48" rx="18" fill="#ffb896" stroke="${L}" ${SW}="5"/>` +
    `<rect x="8" y="84" width="54" height="104" rx="24" fill="#ff9f7a" stroke="${L}" ${SW}="5"/>` +
    `<rect x="198" y="84" width="54" height="104" rx="24" fill="#ff9f7a" stroke="${L}" ${SW}="5"/>` +
    `<rect x="30" y="170" width="200" height="30" rx="12" fill="#f08462" stroke="${L}" ${SW}="5"/>` +
    `<path d="M44 200 V216 M216 200 V216" stroke="${L}" ${SW}="8" stroke-linecap="round"/>` +
    `</svg>`;

  A.partyTable = (o = {}) =>
    `<svg viewBox="0 0 400 220" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
    `<ellipse cx="200" cy="210" rx="170" ry="10" fill="rgba(107,63,42,.15)"/>` +
    `<path d="M26 44 Q24 180 40 206 Q200 222 360 206 Q376 180 374 44 Z" fill="#fff9ef" stroke="${L}" ${SW}="4" stroke-linejoin="round"/>` +
    `<path d="M40 204 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0 q10 10 20 0" fill="none" stroke="#ffb3c7" ${SW}="4"/>` +
    `<path d="M26 60 Q200 110 374 60" stroke="#ffe0a8" ${SW}="6" fill="none"/>` +
    `<ellipse cx="200" cy="44" rx="176" ry="32" fill="#fff" stroke="${L}" ${SW}="4"/>` +
    `<ellipse cx="200" cy="42" rx="150" ry="22" fill="#fff4e0"/>` +
    (o.bows ? tableBowsInner() : '') +
    `</svg>`;

  function tableBowsInner() {
    return [80, 200, 320]
      .map(
        (x) =>
          `<g transform="translate(${x} 96)"><path d="M-2 4 L-12 34 L-4 30 L0 8 M2 4 L12 34 L4 30 L0 8" fill="#ff7aa8" stroke="${L}" ${SW}="2.5" stroke-linejoin="round"/><path d="M0 0 Q-24 -22 -30 -6 Q-32 12 0 2 Q32 12 30 -6 Q24 -22 0 0Z" fill="#ff7aa8" stroke="${L}" ${SW}="2.5"/><circle r="7" fill="#ff5c93" stroke="${L}" ${SW}="2.5"/></g>`
      )
      .join('');
  }
  A.tableBows = () => `<svg viewBox="0 0 400 220" aria-hidden="true" preserveAspectRatio="xMidYMax meet">${tableBowsInner()}</svg>`;

  A.chair = (flip) =>
    `<svg viewBox="0 0 120 200" aria-hidden="true" preserveAspectRatio="xMidYMax meet"${flip ? ' style="transform:scaleX(-1)"' : ''}>` +
    `<rect x="22" y="8" width="76" height="100" rx="20" fill="#e8a868" stroke="${L}" ${SW}="4"/>` +
    `<rect x="36" y="22" width="48" height="70" rx="12" fill="#ffcf8a" stroke="${L}" ${SW}="3"/>` +
    `<rect x="12" y="104" width="96" height="26" rx="10" fill="#ffb3c7" stroke="${L}" ${SW}="4"/>` +
    `<path d="M26 130 V194 M94 130 V194" stroke="${L}" ${SW}="9" stroke-linecap="round"/><path d="M26 130 V192 M94 130 V192" stroke="#c98a55" ${SW}="4" stroke-linecap="round"/>` +
    `</svg>`;

  A.balloonCluster = () => {
    const b = (x, y, c, r) =>
      `<g class="bal" style="--bd:${(Math.random() * 2).toFixed(2)}s"><path d="M${x} ${y + r * 1.2} Q${x + 6} ${y + 120} 100 330" stroke="${L}" ${SW}="1.8" fill="none"/>` +
      `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.2}" fill="${c}" stroke="${L}" ${SW}="3"/>` +
      `<path d="M${x - 4} ${y + r * 1.2 + 5} l4 -6 l4 6z" fill="${c}" stroke="${L}" ${SW}="2"/>` +
      `<ellipse cx="${x - r * 0.35}" cy="${y - r * 0.45}" rx="${r * 0.22}" ry="${r * 0.35}" fill="#fff" opacity=".55"/></g>`;
    return (
      `<svg viewBox="0 0 200 340" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
      b(58, 90, '#ffd54f', 34) + b(142, 84, '#ff8fab', 34) + b(100, 52, '#ff9a3c', 38) + b(74, 150, '#ffb3c7', 28) + b(128, 146, '#ffe082', 28) +
      `<path d="M86 320 H114 L110 338 H90 Z" fill="#c98a55" stroke="${L}" ${SW}="3"/>` +
      `</svg>`
    );
  };

  A.banner = () => {
    const letters = 'HAPPY BIRTHDAY LISA!'.split('');
    const colors = ['#ff9a3c', '#ffd54f', '#ff8fab', '#8ed0a8', '#9ad8ff'];
    let flags = '';
    let x = 30;
    const step = 540 / letters.length;
    letters.forEach((ch, i) => {
      const t = (i + 0.5) / letters.length;
      const y = 20 + Math.sin(t * Math.PI) * 34;
      if (ch !== ' ') {
        flags += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path d="M-14 0 L14 0 L0 40 Z" fill="${colors[i % colors.length]}" stroke="${L}" ${SW}="2.5" stroke-linejoin="round"/>` +
          `<text y="21" text-anchor="middle" font-size="17" font-weight="900" fill="#fff" stroke="${L}" ${SW}="1.2" paint-order="stroke" font-family="ui-rounded,system-ui,sans-serif">${ch}</text></g>`;
      }
      x += step;
    });
    return (
      `<svg viewBox="0 0 600 110" aria-hidden="true">` +
      `<path d="M10 14 Q300 90 590 14" stroke="${L}" ${SW}="3" fill="none"/>` +
      flags +
      `<circle cx="10" cy="14" r="6" fill="#c98a55" stroke="${L}" ${SW}="2"/><circle cx="590" cy="14" r="6" fill="#c98a55" stroke="${L}" ${SW}="2"/>` +
      `</svg>`
    );
  };

  A.fairyLights = () => {
    const colors = ['#ffd54f', '#ff8fab', '#ff9a3c', '#9ad8ff', '#8bd35f'];
    let bulbs = '';
    for (let i = 0; i < 22; i++) {
      const x = 20 + i * 46;
      const y = 18 + (i % 2 ? 20 : 4) + Math.sin(i) * 3;
      bulbs += `<g class="bulb" style="--bd:${((i * 0.37) % 2).toFixed(2)}s"><circle cx="${x}" cy="${y + 12}" r="14" fill="${colors[i % 5]}" opacity=".35" class="glow"/><ellipse cx="${x}" cy="${y + 10}" rx="6" ry="9" fill="${colors[i % 5]}" stroke="${L}" ${SW}="2"/><rect x="${x - 4}" y="${y - 2}" width="8" height="5" rx="1" fill="#6b8a4a"/></g>`;
    }
    return `<svg viewBox="0 0 1040 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 18 ${Array.from({ length: 23 }, (_, i) => `L${20 + i * 46} ${18 + (i % 2 ? 20 : 4)}`).join(' ')}" stroke="#5a8a3a" ${SW}="2.5" fill="none"/>${bulbs}</svg>`;
  };

  A.vase = () =>
    `<svg viewBox="0 0 100 120" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
    `<g stroke="${L}" ${SW}="3" stroke-linecap="round" fill="none"><path d="M50 70 V36 M40 70 Q30 50 22 40 M60 70 Q70 50 78 36"/></g>` +
    [[22, 36, '#ff9a3c'], [78, 32, '#ff8fab'], [50, 26, '#ffd54f'], [34, 50, '#fff'], [66, 48, '#ffb3c7']]
      .map(
        ([x, y, c]) =>
          `<g transform="translate(${x} ${y})"><g fill="${c}" stroke="${L}" ${SW}="2"><circle cy="-7" r="6.5"/><circle cx="7" cy="-2" r="6.5"/><circle cx="4.5" cy="7" r="6.5"/><circle cx="-4.5" cy="7" r="6.5"/><circle cx="-7" cy="-2" r="6.5"/></g><circle r="4" fill="#ffe082" stroke="${L}" ${SW}="1.5"/></g>`
      )
      .join('') +
    `<path d="M30 70 H70 L64 116 H36 Z" fill="#8fd0e8" stroke="${L}" ${SW}="3.5" stroke-linejoin="round"/><path d="M40 80 Q38 96 42 108" stroke="#fff" ${SW}="4" opacity=".6" fill="none" stroke-linecap="round"/>` +
    `</svg>`;

  A.giftBig = (c1 = '#ff8fab', c2 = '#ffd54f') =>
    `<svg viewBox="0 0 120 120" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
    `<rect x="12" y="46" width="96" height="70" rx="6" fill="${c1}" stroke="${L}" ${SW}="4"/>` +
    `<rect x="6" y="32" width="108" height="20" rx="6" fill="${c1}" stroke="${L}" ${SW}="4"/>` +
    `<rect x="52" y="32" width="16" height="84" fill="${c2}" stroke="${L}" ${SW}="3.5"/>` +
    `<path d="M60 32 Q34 2 28 20 Q32 34 60 32 Q86 2 92 20 Q88 34 60 32Z" fill="${c2}" stroke="${L}" ${SW}="3.5"/>` +
    `<g fill="#fff" opacity=".5"><circle cx="30" cy="70" r="4"/><circle cx="88" cy="90" r="4"/><circle cx="34" cy="100" r="3"/></g>` +
    `</svg>`;

  A.hatsPair = () => `<svg viewBox="0 0 160 80" aria-hidden="true">` +
    `<g transform="translate(10 4) scale(1.1)">${ICONS.hats}</g><g transform="translate(84 12) scale(1)">${ICONS.hats.replace(/#ffd54f/g, '#9ad8ff').replace(/#ff8fab/g, '#ffd54f')}</g></svg>`;

  A.confettiFloor = () => {
    const rnd = seeded(3);
    const colors = ['#ff6f91', '#ffd54f', '#4fc3f7', '#8bd35f', '#ff9a3c', '#b388ff'];
    let s = '';
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 1000;
      const y = 10 + rnd() * 180;
      const c = colors[i % colors.length];
      s += rnd() > 0.5
        ? `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="12" height="7" rx="2" fill="${c}" transform="rotate(${Math.floor(rnd() * 180)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`
        : `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4.5" fill="${c}"/>`;
    }
    return `<svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
  };

  A.surpriseBox = () =>
    `<svg viewBox="0 0 160 140" aria-hidden="true" preserveAspectRatio="xMidYMax meet">` +
    `<rect x="14" y="30" width="132" height="106" rx="8" fill="#9ad8ff" stroke="${L}" ${SW}="4"/>` +
    `<rect x="72" y="30" width="16" height="106" fill="#ff8fab" stroke="${L}" ${SW}="3.5"/>` +
    `<g fill="#fff" opacity=".6"><circle cx="36" cy="60" r="5"/><circle cx="120" cy="100" r="5"/><circle cx="44" cy="112" r="4"/><circle cx="118" cy="56" r="4"/></g>` +
    `<g transform="rotate(-24 150 30)"><rect x="96" y="6" width="76" height="20" rx="6" fill="#9ad8ff" stroke="${L}" ${SW}="4"/></g>` +
    `</svg>`;

  /* ================================================================
     BACKGROUNDS (decor only; interactive things are separate elements)
     ================================================================ */
  A.kitchenBg = (p) =>
    `<svg class="bg-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>` +
    `<linearGradient id="${p}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9c4"/><stop offset="1" stop-color="#ffd69a"/></linearGradient>` +
    `<pattern id="${p}stripe" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="22" height="64" fill="#fff4dc" opacity=".6"/><circle cx="43" cy="32" r="3.5" fill="#ffc98a" opacity=".55"/></pattern>` +
    `<pattern id="${p}tile" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="#fff7ea"/><rect width="28" height="28" fill="#ffd9ae"/><rect x="28" y="28" width="28" height="28" fill="#ffd9ae"/></pattern>` +
    `<pattern id="${p}floor" width="240" height="70" patternUnits="userSpaceOnUse"><rect width="240" height="70" fill="#d99a60"/><rect width="240" height="35" fill="#e2a86e"/><path d="M0 35H240M0 70H240M80 0V35M200 35V70" stroke="#c4834b" stroke-width="3"/></pattern>` +
    `<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8ff"/><stop offset="1" stop-color="#fff0cf"/></linearGradient>` +
    `</defs>` +
    `<rect width="1600" height="1000" fill="url(#${p}wall)"/><rect width="1600" height="480" fill="url(#${p}stripe)"/>` +
    `<rect width="1600" height="24" fill="#f2b36b"/><rect y="24" width="1600" height="8" fill="#e59b4f"/>` +
    `<rect y="470" width="1600" height="190" fill="url(#${p}tile)"/><rect y="466" width="1600" height="8" fill="#f3c690"/>` +
    // window
    `<g transform="translate(290 120)"><rect x="-16" y="-16" width="332" height="312" rx="24" fill="#f6c27f" stroke="${L}" stroke-width="5"/>` +
    `<rect width="300" height="280" rx="14" fill="url(#${p}sky)" stroke="${L}" stroke-width="4"/><circle cx="222" cy="78" r="34" fill="#ffd54f"/>` +
    `<ellipse cx="86" cy="62" rx="44" ry="15" fill="#fff"/><ellipse cx="116" cy="52" rx="28" ry="14" fill="#fff"/>` +
    `<path d="M0 206 Q80 168 150 196 T300 186 V280 H0Z" fill="#b8df8c"/><path d="M0 238 Q90 210 180 234 T300 228 V280 H0Z" fill="#9fd274"/>` +
    `<path d="M150 0V280M0 140H300" stroke="${L}" stroke-width="7"/>` +
    `<path d="M-36 -30 Q30 -36 104 -30 Q70 60 96 160 Q40 176 -36 168Z" fill="#ffa3b8" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M336 -30 Q270 -36 196 -30 Q230 60 204 160 Q260 176 336 168Z" fill="#ffa3b8" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="M-10 -26 Q-4 60 -14 160 M30 -30 Q40 70 30 166 M310 -26 Q304 60 314 160 M270 -30 Q260 70 270 166" stroke="#ff8aa5" stroke-width="5" fill="none"/>` +
    `<rect x="-40" y="286" width="380" height="24" rx="10" fill="#f0a960" stroke="${L}" stroke-width="4"/>` +
    `<g transform="translate(44 230)"><path d="M0 56 L8 20 H52 L60 56 Z" fill="#e57a4a" stroke="${L}" stroke-width="4"/><g fill="#7cc653" stroke="${L}" stroke-width="3"><ellipse cx="18" cy="6" rx="10" ry="18" transform="rotate(-30 18 6)"/><ellipse cx="42" cy="4" rx="10" ry="18" transform="rotate(30 42 4)"/><ellipse cx="30" cy="-6" rx="10" ry="20"/></g></g>` +
    `<g transform="translate(236 244)"><rect x="0" y="0" width="44" height="42" rx="8" fill="#9ad8ff" stroke="${L}" stroke-width="4"/><circle cx="22" cy="-8" r="14" fill="#ff8fab" stroke="${L}" stroke-width="3"/><circle cx="22" cy="-8" r="5" fill="#ffd54f"/></g></g>` +
    // utensil rail
    `<g transform="translate(920 140)"><rect x="0" y="0" width="300" height="12" rx="6" fill="#c98a55" stroke="${L}" stroke-width="4"/>` +
    `<g stroke="${L}" stroke-width="4" stroke-linejoin="round"><path d="M40 12 V110" /><ellipse cx="40" cy="126" rx="18" ry="24" fill="#d9965c"/>` +
    `<path d="M110 12 V96"/><path d="M110 96 C88 120 92 160 110 168 C128 160 132 120 110 96" fill="none" stroke="#8fa0ad"/>` +
    `<path d="M180 12 V80"/><circle cx="180" cy="120" r="40" fill="#ff9f45"/><circle cx="180" cy="120" r="28" fill="#ffb86b"/>` +
    `<path d="M260 12 V100"/><path d="M244 100 H276 V140 Q260 160 244 140 Z" fill="#d6ecf7"/></g></g>` +
    // shelf with jars
    `<g transform="translate(1260 170)"><rect x="0" y="120" width="300" height="18" rx="6" fill="#c98a55" stroke="${L}" stroke-width="4"/>` +
    `<g stroke="${L}" stroke-width="4"><rect x="20" y="40" width="60" height="80" rx="12" fill="#fff4e0"/><rect x="16" y="28" width="68" height="16" rx="6" fill="#ff8fab"/>` +
    `<rect x="110" y="56" width="70" height="64" rx="14" fill="#d6ecf7"/><rect x="106" y="44" width="78" height="16" rx="6" fill="#ffd54f"/>` +
    `<rect x="210" y="30" width="60" height="90" rx="12" fill="#fff4e0"/><rect x="206" y="18" width="68" height="16" rx="6" fill="#9ccaa4"/></g>` +
    `<text x="50" y="92" text-anchor="middle" font-size="22" font-weight="900" fill="#c98a55" font-family="ui-rounded,system-ui,sans-serif">🍪</text>` +
    `<g fill="#ff8c2e"><circle cx="134" cy="96" r="7"/><circle cx="152" cy="100" r="7"/><circle cx="144" cy="84" r="7"/></g>` +
    `<text x="240" y="84" text-anchor="middle" font-size="18" font-weight="900" fill="#c98a55" font-family="ui-rounded,system-ui,sans-serif">SUGAR</text></g>` +
    // back counter
    `<rect y="640" width="1600" height="34" fill="#f5cf96" stroke="${L}" stroke-width="5"/>` +
    `<rect y="674" width="1600" height="126" fill="#e7a567"/>` +
    `<g fill="#eeb57a" stroke="${L}" stroke-width="4">${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200 + 18}" y="690" width="164" height="96" rx="10"/>`).join('')}</g>` +
    `<g fill="#ffd54f" stroke="${L}" stroke-width="3">${Array.from({ length: 8 }, (_, i) => `<circle cx="${i * 200 + 100}" cy="716" r="7"/>`).join('')}</g>` +
    // oven in the counter
    `<g transform="translate(1140 560)"><rect x="0" y="0" width="260" height="240" rx="16" fill="#ffb86b" stroke="${L}" stroke-width="5"/>` +
    `<rect x="0" y="0" width="260" height="56" rx="16" fill="#ff9f45" stroke="${L}" stroke-width="5"/>` +
    `<g fill="#fff5e6" stroke="${L}" stroke-width="3.5"><circle cx="50" cy="28" r="13"/><circle cx="96" cy="28" r="13"/><circle cx="142" cy="28" r="13"/></g>` +
    `<rect x="178" y="16" width="64" height="24" rx="8" fill="#5b3a2a" stroke="${L}" stroke-width="3"/>` +
    `<rect x="26" y="80" width="208" height="140" rx="14" fill="#8a5a3c" stroke="${L}" stroke-width="4"/>` +
    `<rect x="50" y="104" width="160" height="92" rx="12" fill="#5a3322" stroke="${L}" stroke-width="3"/><rect x="72" y="86" width="116" height="10" rx="5" fill="#e0e0e0" stroke="${L}" stroke-width="3"/></g>` +
    // floor + rug
    `<rect y="800" width="1600" height="200" fill="url(#${p}floor)"/><rect y="796" width="1600" height="10" fill="#b8763f"/>` +
    `<ellipse cx="800" cy="930" rx="460" ry="60" fill="#ffcf8a" stroke="#e8a35a" stroke-width="8"/><ellipse cx="800" cy="930" rx="400" ry="42" fill="none" stroke="#ff9fb3" stroke-width="6" stroke-dasharray="18 14"/>` +
    `</svg>`;

  A.gardenBg = (p) =>
    `<svg class="bg-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>` +
    `<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd6ff"/><stop offset=".55" stop-color="#d9efff"/><stop offset="1" stop-color="#fff0cf"/></linearGradient>` +
    `<linearGradient id="${p}grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8d977"/><stop offset="1" stop-color="#86c55c"/></linearGradient>` +
    `</defs>` +
    `<rect width="1600" height="1000" fill="url(#${p}sky)"/>` +
    `<g class="sun" transform="translate(1330 150)"><g class="sun-rays" stroke="#ffd54f" stroke-width="10" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => `<path d="M0 -100 V-78" transform="rotate(${i * 30})"/>`).join('')}</g><circle r="64" fill="#ffd54f"/><circle r="50" fill="#ffe27a"/></g>` +
    `<path d="M0 470 Q200 380 420 450 T860 430 T1300 420 T1600 450 V1000 H0Z" fill="#cde9a3"/>` +
    `<path d="M0 520 Q260 450 520 510 T1060 500 T1600 500 V1000 H0Z" fill="#b6de88"/>` +
    // fence
    `<g transform="translate(0 470)"><rect x="0" y="30" width="1600" height="14" fill="#e8b57c" stroke="${L}" stroke-width="3"/><rect x="0" y="70" width="1600" height="14" fill="#e8b57c" stroke="${L}" stroke-width="3"/>` +
    `<g fill="#f6d2a2" stroke="${L}" stroke-width="3.5" stroke-linejoin="round">${Array.from({ length: 27 }, (_, i) => `<path d="M${i * 62 + 6} 110 V14 L${i * 62 + 24} -4 L${i * 62 + 42} 14 V110 Z"/>`).join('')}</g></g>` +
    `<path d="M0 560 Q400 520 800 556 T1600 548 V1000 H0Z" fill="url(#${p}grass)"/>` +
    // path
    `<path d="M700 1000 Q760 820 880 720 Q940 660 1000 600 L1060 604 Q1000 680 960 740 Q880 860 900 1000 Z" fill="#ecd0a3" stroke="#d9b47e" stroke-width="5"/>` +
    // tulips along fence
    Array.from({ length: 22 }, (_, i) => {
      const x = 30 + i * 74;
      const c = ['#ff8fab', '#ff9a3c', '#ffd54f', '#ffb3c7'][i % 4];
      return `<g transform="translate(${x} ${574 + (i % 3) * 6})"><path d="M0 0 V-34" stroke="#5aa84a" stroke-width="4"/><path d="M-10 -34 Q-10 -52 -5 -50 L0 -58 L5 -50 Q10 -52 10 -34 Q0 -26 -10 -34Z" fill="${c}" stroke="${L}" stroke-width="2.5"/><ellipse cx="-8" cy="-14" rx="8" ry="3.5" fill="#6cc04a" transform="rotate(-30 -8 -14)"/></g>`;
    }).join('') +
    // grass specks
    `<g fill="#78b94f">${Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 173) % 1600} ${640 + ((i * 97) % 340)} l6 -18 l6 18z"/>`).join('')}</g>` +
    `<g fill="#fff">${Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 311) % 1600}" cy="${660 + ((i * 131) % 320)}" r="5"/>`).join('')}</g>` +
    `</svg>`;

  A.shopBg = (p) =>
    `<svg class="bg-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>` +
    `<pattern id="${p}planks" width="120" height="1000" patternUnits="userSpaceOnUse"><rect width="120" height="1000" fill="#f3c48e"/><rect width="60" height="1000" fill="#eeba80"/><path d="M0 0 V1000 M60 0 V1000" stroke="#dca46a" stroke-width="3"/></pattern>` +
    `<pattern id="${p}tiles" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="#f7dcb4"/><rect width="50" height="50" fill="#efc793"/><rect x="50" y="50" width="50" height="50" fill="#efc793"/></pattern>` +
    `<linearGradient id="${p}out" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcff"/><stop offset="1" stop-color="#fff0cf"/></linearGradient>` +
    `</defs>` +
    `<rect width="1600" height="1000" fill="url(#${p}planks)"/>` +
    // window behind counter
    `<g transform="translate(620 170)"><rect x="-14" y="-14" width="388" height="268" rx="22" fill="#d98f4e" stroke="${L}" stroke-width="5"/>` +
    `<rect width="360" height="240" rx="12" fill="url(#${p}out)" stroke="${L}" stroke-width="4"/>` +
    `<path d="M0 170 Q90 130 180 160 T360 150 V240 H0Z" fill="#b8df8c"/><circle cx="290" cy="70" r="30" fill="#ffd54f"/>` +
    `<path d="M180 0 V240" stroke="${L}" stroke-width="7"/>` +
    `<g transform="translate(60 40)"><rect width="96" height="44" rx="10" fill="#fff" stroke="${L}" stroke-width="4"/><text x="48" y="31" text-anchor="middle" font-size="24" font-weight="900" fill="#e8574f" font-family="ui-rounded,system-ui,sans-serif">OPEN</text></g></g>` +
    // awning
    `<g><rect width="1600" height="80" fill="#fff4e0"/>${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 80}" width="40" height="80" fill="#ff9f45"/>`).join('')}` +
    `<path d="M0 80 ${Array.from({ length: 40 }, (_, i) => `q20 34 40 0`).join(' ')}" fill="#fff4e0" stroke="${L}" stroke-width="4"/>` +
    `${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 80} 80 q20 34 40 0 z" fill="#ff9f45"/>`).join('')}` +
    `<path d="M0 80 H1600" stroke="${L}" stroke-width="4"/></g>` +
    // sign
    `<g transform="translate(800 120)"><path d="M-160 -20 V-44 M160 -20 V-44" stroke="${L}" stroke-width="4"/>` +
    `<rect x="-200" y="-20" width="400" height="74" rx="20" fill="#8a5a3c" stroke="${L}" stroke-width="5"/>` +
    `<text x="0" y="32" text-anchor="middle" font-size="42" font-weight="900" fill="#ffd54f" stroke="#5b3a2a" stroke-width="2" paint-order="stroke" font-family="ui-rounded,system-ui,sans-serif">🥕 CARROT MARKET 🥕</text></g>` +
    // plants & floor
    `<rect y="790" width="1600" height="210" fill="url(#${p}tiles)"/><rect y="784" width="1600" height="12" fill="#c98a55"/>` +
    `</svg>`;

  A.partyBg = (p) =>
    `<svg class="bg-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>` +
    `<pattern id="${p}paper" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#fff1dc"/><rect x="0" width="26" height="80" fill="#ffe7c7"/><circle cx="53" cy="20" r="4" fill="#ffd0a0"/><circle cx="53" cy="60" r="4" fill="#ffc3cf"/></pattern>` +
    `<pattern id="${p}floor" width="200" height="60" patternUnits="userSpaceOnUse"><rect width="200" height="60" fill="#d9a06a"/><rect width="200" height="30" fill="#e0aa74"/><path d="M0 30H200M0 60H200M60 0V30M160 30V60" stroke="#c4874f" stroke-width="3"/></pattern>` +
    `</defs>` +
    `<rect width="1600" height="1000" fill="url(#${p}paper)"/>` +
    `<rect y="0" width="1600" height="26" fill="#f2b36b"/><rect y="26" width="1600" height="8" fill="#e59b4f"/>` +
    `<rect y="520" width="1600" height="180" fill="#f7d3a3"/><rect y="512" width="1600" height="14" rx="4" fill="#e8a868" stroke="${L}" stroke-width="3"/>` +
    `<g fill="none" stroke="#e8b27a" stroke-width="5">${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 200 + 24}" y="548" width="152" height="120" rx="10"/>`).join('')}</g>` +
    // picture frames (one drawn by Lisa!)
    `<g transform="translate(560 230) rotate(-2)"><rect width="130" height="110" rx="8" fill="#c98a55" stroke="${L}" stroke-width="4"/><rect x="12" y="12" width="106" height="86" rx="4" fill="#fffaf0"/>` +
    `<path d="M40 70 C44 50 70 46 84 60 C90 70 80 84 60 86 Z" fill="#ff9a3c" stroke="${L}" stroke-width="3"/><path d="M40 70 q-10 -10 -14 -18 M42 66 q-4 -14 0 -22" stroke="#6cb948" stroke-width="4" fill="none"/><rect x="52" y="56" width="30" height="8" rx="4" fill="#3a221c"/></g>` +
    `<g transform="translate(900 250) rotate(3)"><rect width="110" height="90" rx="8" fill="#c98a55" stroke="${L}" stroke-width="4"/><rect x="12" y="12" width="86" height="66" rx="4" fill="#bfe6ff"/><circle cx="72" cy="34" r="12" fill="#ffd54f"/><path d="M12 64 Q50 40 98 60 V78 H12Z" fill="#9fd274"/></g>` +
    `<rect y="700" width="1600" height="300" fill="url(#${p}floor)"/><rect y="694" width="1600" height="12" fill="#b8763f"/>` +
    `<ellipse cx="800" cy="880" rx="520" ry="80" fill="#ffcf8a" stroke="#e8a35a" stroke-width="8"/><ellipse cx="800" cy="880" rx="450" ry="56" fill="none" stroke="#ff9fb3" stroke-width="7" stroke-dasharray="20 16"/>` +
    `</svg>`;
})(window.BB);
