# 🐰 Bunny Birthday Adventure

A cozy, offline point-and-click game. Help the bunnies secretly prepare a surprise party for **Lisa's 16th birthday on September 26th**. You bake her cake, make muffins, shop at the Carrot Market, decorate the party room and keep the surprise a secret.

A full playthrough takes about **15–20 minutes**.

## How to play

**Just open `index.html` in a browser.** You don't need a server, an install, a login or an internet connection.
Everything, including the artwork and sounds, lives in this folder.

Progress saves automatically in your browser (`localStorage`), so refreshing the page or coming back later picks up where you left off.
To start over, open **⚙️ Settings → Reset Game**.

### Share it with a link (free https hosting)

The game is plain static files, so GitHub Pages can host it:

1. On GitHub, open this repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Pick the branch that has the game and the **/ (root)** folder, then click **Save**.
4. After a minute or two the game is live at `https://<your-username>.github.io/<repository-name>/`.

Anyone can open that link. After the first visit, the game also works **offline**: `sw.js` caches every file, and on phones it can be added to the home screen as an app.

### Controls

| Action | Mouse / touch | Keyboard |
| --- | --- | --- |
| Talk to a bunny, use an object | Click / tap it | `Tab` to it, then `Enter` |
| Dialogue: next line / pick an answer | Click the box / an answer | `Enter` or `Space` / `1`–`4` |
| To-do list, inventory, map | Dock buttons | `T`, `I`, `M` |
| Teleport | 📍 MAP, or the "Next" hint's **Go** button | `1` Kitchen · `2` Garden · `3` Shop · `4` Party Room |
| Close a panel or pop-up | ✕ | `Esc` |
| Pour the milk (cake) | Press and hold **Hold to pour** | Hold `Space` on the button |

## What's inside

- **4 locations**: the Kitchen, the Garden, the Carrot Market and the Party Room. You can teleport between them instantly at any time.
- **7 bunnies**, each with their own look and personality. Hazel the planner, Poppy the baker, Coco the decorator, chaotic Milo, snack-loving Bun, Max (Lisa's best friend) and Bramble the shopkeeper. Lisa herself only appears for the surprise.
- **Branching conversations** with multiple-choice answers. Lines you've already seen appear instantly, and conversations you've finished before can be skipped.
- **Cake mini-game** in 12 steps: crack eggs, hold to pour the milk, scoop flour, add butter, stir (tap or drag circles), add chocolate, pour into the tin, bake with a countdown, take it out, choose and spread frosting, shake sprinkles, and add the "1" and "6" candles. Mistakes just get a funny reaction.
- **Muffin mini-game**: pick a batter, fill six cups, add chocolate chips, bake, then decorate each muffin.
- **Carrot economy**: you start with 30 carrots, find more hidden in the garden (in bushes, even up a tree), and earn rewards. If you ever run short, the garden regrows, so you can't get stuck.
- **Click-to-place decorating** with balloons, a banner, fairy lights, flowers, gifts, party hats, bows, confetti, chairs and the cake table.
- **The surprise**: hide everyone, turn out the lights, and… 🎉
- An auto-updating **to-do list** and progress bar, an **inventory**, and a "Next" hint.
- **Sound** synthesised with the Web Audio API: sound effects, a gentle music-box loop and "Happy Birthday" for the finale. Sound and music can be toggled separately.
- **Accessibility**: keyboard play, visible focus, large click targets, readable contrast, and reduced-motion support. It follows your OS `prefers-reduced-motion` setting, or you can choose in Settings.
- **Responsive**: desktop, tablet and phones (portrait uses a bottom toolbar; landscape uses a compact side dock).

## Project structure

```
index.html        page shell: title screen, game screen, finale screen
css/style.css     all styling and animation (warm orange / golden / cream theme)
js/core.js        namespace, helpers, event bus
js/data.js        items, locations, characters
js/state.js       central game state (BB.S) + localStorage save/load/reset
js/audio.js       Web Audio sound effects and music
js/art.js         every illustration as inline SVG (bunnies, props, backgrounds)
js/fx.js          particles, floating text, confetti, toasts, speech bubbles
js/game.js        rules: carrots, shopping, tasks & progress, hints, who is where
js/ui.js          HUD, to-do / inventory / map panels, settings, modals
js/dialogue.js    dialogue engine (typewriter, choices, skip)
js/characters.js  all conversations
js/scenes.js      scene manager + Kitchen and Carrot Market
js/garden.js      the Garden and its carrot hunt
js/party.js       Party Room decorating and hiding for the surprise
js/cake.js        mini-game shell + the birthday cake mini-game
js/muffins.js     the muffin mini-game
js/finale.js      the surprise party ending
js/main.js        boot, title screen, new game / continue
```

The scripts are plain `<script>` files rather than ES modules, so the game also runs when opened directly from disk (`file://`).
