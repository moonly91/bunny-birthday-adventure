/* Bunny Birthday Adventure — characters.js
   Every bunny's conversations. talk(id) picks the right one for the current state. */
(function (BB) {
  'use strict';

  const G = () => BB.game;
  const bye = (t) => ({ t, next: 'end' });

  const listNames = (ids) => {
    const names = ids.map((id) => BB.ITEMS[id].name.toLowerCase());
    if (names.length <= 1) return names.join('');
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  };

  /* ---------------- HAZEL — organised party planner ---------------- */
  function hazelStatus(s) {
    const st = (done) => (done ? 'Done ✓' : 'Not finished');
    return (
      `Let's check the list. Cake? ${st(s.cake.done)}. Muffins? ${st(s.muffins.done)}. Decorations? ${st(G().taskDone('decorate'))}. ` +
      `Panic? Completely unnecessary.`
    );
  }

  const HAZEL = {
    intro: {
      id: 'hazel_intro',
      start: 'a',
      nodes: {
        a: { t: "Oh, thank goodness — a helper! I'm Hazel. I have a clipboard, so I'm in charge.", next: 'b' },
        b: {
          t: "Tomorrow is September 26th. Lisa's 16th birthday! And we are throwing her a SURPRISE party.",
          choices: [
            { l: "A surprise party? I'm in!", next: 'yes' },
            { l: "Who's Lisa?", next: 'who' },
          ],
        },
        yes: { t: 'Wonderful. Enthusiasm: noted. ✓', next: 'plan' },
        who: { t: 'Lisa! Kindest bunny in the whole burrow. She doodles little suns on everyone’s lunch bags. She deserves the best party ever.', next: 'plan' },
        plan: {
          t: "Here's the plan — it's on your to-do list. Cake, muffins, decorations… and one very well-kept secret.",
          do: () => {
            if (!BB.S.flags.plan) {
              G().flag('plan');
              G().changed();
            }
          },
          next: 'who2',
        },
        who2: { t: 'Poppy is baking right here. Coco is in the Party Room. Max and Milo are out in the garden. Milo is… also in the garden. Unfortunately.', next: 'map' },
        map: {
          t: 'Use the 📍 MAP to hop between places instantly. We do not have time for walking.',
          choices: [
            { l: 'Got it, boss!', next: 'boss' },
            { l: 'What if I mess something up?', next: 'mess' },
          ],
        },
        boss: bye('Boss. I like that. Now go — and remember: no panicking.'),
        mess: bye('Then we fix it. Panic? Completely unnecessary.'),
      },
    },
    check: {
      id: 'hazel_check',
      start: 'a',
      nodes: {
        a: {
          t: hazelStatus,
          choices: [
            { l: 'What should I do next?', next: 'next' },
            { l: "You're very organized.", next: 'org' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        next: { t: () => `Next up: ${G().hint().text.toLowerCase()}. Chop chop! Politely.`, next: 'end' },
        org: bye('Thank you. I have a clipboard for my clipboards.'),
        bye: bye('Off you hop!'),
      },
    },
    ready: {
      id: 'hazel_ready',
      start: 'a',
      nodes: {
        a: {
          t: 'Everything is checked. EVERYTHING. I might cry. Max is running the surprise — go talk to him!',
          choices: [
            { l: 'On it!', next: 'end' },
            { l: 'Are you… crying?', next: 'cry' },
          ],
        },
        cry: bye('It’s allergies. To success.'),
      },
    },
    done: {
      id: 'hazel_done',
      start: 'a',
      nodes: { a: bye('The checklist is complete, the party is a success, and I have never been happier. Don’t tell anyone I said that.') },
    },
  };

  /* ---------------- POPPY — warm, food-obsessed perfectionist baker ---------------- */
  const POPPY = {
    hello: {
      id: 'poppy_hello',
      start: 'a',
      nodes: {
        a: { t: "Hi hi hi! I'm Poppy! Welcome to my kitchen — mind the flour, it gets everywhere.", next: 'b' },
        b: {
          t: 'The cake has to be PERFECT for Lisa! Fluffy sponge, silky frosting, sprinkles for days… oh, I’m drooling a little.',
          choices: [
            { l: 'What do we need?', next: 'need' },
            { l: 'Can I lick the spoon?', next: 'spoon' },
          ],
        },
        spoon: { t: 'Only AFTER the batter’s done. Baker’s rules. Very strict. Mostly.', next: 'need' },
        need: {
          t: 'For the cake: flour, eggs, milk, butter, chocolate, sprinkles and candles! The Carrot Market has everything.',
          do: () => G().flag('knowsCake'),
          next: 'need2',
        },
        need2: bye('And for muffins, grab muffin cups and chocolate chips. When you’re ready, tap my mixing bowl!'),
      },
    },
    wait: {
      id: 'poppy_wait',
      start: 'a',
      nodes: {
        a: {
          t: 'Any luck at the market? My whisk is getting impatient.',
          choices: [
            { l: 'What did we need again?', next: 'list' },
            { l: 'Why is your whisk impatient?', next: 'whisk' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        list: {
          t: () => {
            const miss = G().missing(BB.CAKE_ITEMS);
            return miss.length
              ? `Still missing: ${listNames(miss)}. The 🛍️ Carrot Market has them all!`
              : 'You’ve got everything! Tap the mixing bowl and let’s bake!';
          },
          next: 'end',
        },
        whisk: bye('It’s a very emotional whisk. We don’t talk about the meringue incident.'),
        bye: bye('Bye! Come back with butter!'),
      },
    },
    ready: {
      id: 'poppy_ready',
      start: 'a',
      nodes: {
        a: {
          t: 'You got everything?! Oh, this is so exciting! Shall we bake Lisa’s cake?',
          choices: [
            { l: "Let's bake!", next: 'go' },
            { l: 'Any tips first?', next: 'tips' },
            { l: 'Maybe later.', next: 'later' },
          ],
        },
        tips: {
          t: 'Eggs, milk, flour, butter — then mix, mix, MIX. Don’t worry about mistakes. Flour on the floor is basically decoration.',
          choices: [
            { l: "Let's bake!", next: 'go' },
            { l: 'Maybe later.', next: 'later' },
          ],
        },
        go: { t: 'Aprons on! Let’s go!', do: () => G().flag('startCake'), next: 'end' },
        later: bye('The bowl will wait for you! …Impatiently.'),
      },
      after: () => {
        if (BB.S.flags.startCake) {
          G().flag('startCake', false);
          BB.cake.open();
        }
      },
    },
    muffins: {
      id: 'poppy_muffins',
      start: 'a',
      nodes: {
        a: {
          t: 'The cake is cooling and it smells like HEAVEN. Next up: muffins!',
          choices: [
            { l: "Let's make muffins!", if: () => G().hasAll(BB.MUFFIN_ITEMS), next: 'go' },
            { l: 'What do muffins need?', if: () => !G().hasAll(BB.MUFFIN_ITEMS), next: 'need' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        need: bye('Muffin cups and chocolate chips from the market. I’ve got the batter covered!'),
        go: { t: 'Yay! Tiny cakes for tiny celebrations!', do: () => G().flag('startMuffins'), next: 'end' },
        bye: bye('Bye! I’ll be here. Smelling the cake. Professionally.'),
      },
      after: () => {
        if (BB.S.flags.startMuffins) {
          G().flag('startMuffins', false);
          BB.muffins.open();
        }
      },
    },
    done: {
      id: 'poppy_done',
      start: 'a',
      nodes: {
        a: {
          t: 'Cake: done. Muffins: done. Me: covered in flour and extremely happy.',
          choices: [
            { l: "You're a great baker, Poppy.", next: 'great' },
            { l: 'Do you think Lisa will like it?', next: 'like' },
            { l: 'Bye!', next: 'end' },
          ],
        },
        great: bye('Stop it. …No, keep going.'),
        like: bye(() => (BB.S.cake.frosting === 'chocolate' ? 'Chocolate frosting AND sprinkles? She’s going to do a happy dance.' : 'She’d better! I put love in it. And a LOT of butter.')),
      },
    },
    party: {
      id: 'poppy_party',
      start: 'a',
      nodes: { a: bye('I carried the cake over myself. Very slowly. Very carefully. Nobody breathe near it.') },
    },
  };

  /* ---------------- COCO — creative decoration expert ---------------- */
  const COCO = {
    hello: {
      id: 'coco_hello',
      start: 'a',
      nodes: {
        a: { t: "Oh! Hello! I'm Coco! Look at this room. LOOK at it. It's so… beige.", next: 'b' },
        b: {
          t: 'A birthday party without balloons? Absolutely not!',
          choices: [
            { l: 'What do you need?', next: 'need' },
            { l: 'I think beige is nice.', next: 'beige' },
          ],
        },
        beige: { t: '…I’m going to pretend I didn’t hear that. For your sake.', next: 'need' },
        need: {
          t: 'Balloons and a birthday banner at the very least. Flowers, party hats, confetti, fairy lights… the more the merrier!',
          do: () => {
            if (!BB.S.owned.table) {
              G().give('table');
              G().give('chairs');
              G().flag('knowsDecor');
              G().changed();
            }
          },
          next: 'need2',
        },
        need2: bye('I pulled the cake table and chairs out of storage — they’re in your decoration tray below. Tap an item to place it!'),
      },
    },
    working: {
      id: 'coco_working',
      start: 'a',
      nodes: {
        a: {
          t: 'Ooh, the room is coming alive! Pick a decoration from the tray and I’ll tell you if it’s genius. (It will be.)',
          choices: [
            { l: 'Any decorating tips?', next: 'tips' },
            { l: "What's still missing?", next: 'miss' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        tips: bye('Lisa loves warm colours — oranges and yellows, like a sunset. Everything I pick is sunset-approved.'),
        miss: {
          t: () => {
            const need = [];
            if (!G().isPlaced('table')) need.push('the cake table');
            if (!G().isPlaced('balloons')) need.push(G().owned('balloons') ? 'the balloons' : 'balloons from the shop');
            if (!G().isPlaced('banner')) need.push(G().owned('banner') ? 'the banner' : 'a banner from the shop');
            const n = G().decorCount();
            if (need.length) return `We still need ${need.join(', ')}. And at least five decorations total — we’re at ${n}!`;
            if (n < 5) return `We need at least five decorations — we’re at ${n}. Something extra from the shop, maybe?`;
            return 'Honestly? Nothing. It’s gorgeous. I’m a genius.';
          },
          next: 'end',
        },
        bye: bye('Byeee! Bring me sparkly things!'),
      },
    },
    done: {
      id: 'coco_done',
      start: 'a',
      nodes: {
        a: {
          t: 'It’s PERFECT. Well, 98% perfect. The other 2% is Milo.',
          choices: [
            { l: 'Where is Milo?', next: 'milo' },
            { l: 'Beautiful work, Coco.', next: 'thanks' },
          ],
        },
        milo: bye('Lounging in the armchair, admiring “his” work.'),
        thanks: bye('I know. But thank you!'),
      },
    },
  };

  /* ---------------- MILO — chaotic, sure he's the most important ---------------- */
  const MILO = {
    hello: {
      id: 'milo_hello',
      start: 'a',
      nodes: {
        a: {
          t: "Hi! I'm Milo! I'm here to help Lisa with her birthday!",
          choices: [
            { l: 'Hi! How are you?', next: 'how' },
            { l: 'Why are you here?', next: 'why' },
          ],
        },
        how: { t: 'AMAZING. I’ve had four carrots and a nap. Peak performance.', next: 'hint' },
        why: {
          t: "I'm here to see Lisa! She's my favourite bunny… wait, that doesn't make sense. I'm HER favourite bunny!",
          choices: [
            { l: 'That sounds suspicious.', next: 'sus' },
            { l: 'Haha, sure you are.', next: 'sure' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        sus: { t: 'Suspicious? ME? I’m the most trustworthy bunny in this garden. Don’t check the tree.', next: 'hint' },
        sure: { t: 'Thank you. Finally, someone who gets it.', next: 'hint' },
        bye: { t: 'Wait— okay, bye! Oh, one more thing!', next: 'hint' },
        hint: bye('Psst. I “stored” some carrots around the garden. In bushes. And maybe a tree. For safekeeping. Take them — for the party!'),
      },
    },
    again: {
      id: 'milo_again',
      start: 'a',
      nodes: {
        a: {
          t: "I'm here to help! …What was I supposed to be doing again?",
          choices: [
            { l: 'Guarding the carrots?', next: 'guard' },
            { l: 'Have you seen Bun?', if: (s) => !s.flags.bunFound, next: 'bun' },
            { l: 'Did you put a carrot in a tree?', if: (s) => !s.garden.tree, next: 'tree' },
            { l: 'Bye!', next: 'end' },
          ],
        },
        guard: bye('Right! Yes! I’m guarding them by hiding them. It’s a strategy.'),
        bun: bye('Bun? Last I saw, he was “inspecting” one of the bushes. For about an hour.'),
        tree: bye('…No comment. (Give it a shake.)'),
      },
    },
    party: {
      id: 'milo_party',
      start: 'a',
      nodes: {
        a: {
          t: 'Wow. This room looks amazing. I definitely helped with this. Probably.',
          choices: [
            { l: 'What did you do?', next: 'what' },
            { l: 'Sure you did.', next: 'sure' },
          ],
        },
        what: bye('Moral support. It’s the hardest job, honestly. Very tiring. That’s why I’m in the armchair.'),
        sure: bye('Thank you for acknowledging my contributions.'),
      },
    },
  };

  /* ---------------- BUN — sweet, clueless, distracted by food ---------------- */
  const BUN = {
    found: {
      id: 'bun_found',
      start: 'a',
      nodes: {
        a: { t: "Oh! Hi! You found me! I wasn't hiding. I was… inspecting this bush.", next: 'b' },
        b: {
          t: 'I was supposed to bring the balloons… but then I found a carrot.',
          choices: [
            { l: 'Did you bring the balloons?', next: 'ball' },
            { l: "You ate the carrot, didn't you?", next: 'ate' },
            { l: 'Never mind.', next: 'nm' },
          ],
        },
        ball: { t: 'No… the balloon stand was right next to a snack stand. It was a whole situation.', next: 'gift' },
        ate: { t: '…I plead the fluff.', next: 'gift' },
        nm: { t: 'Okay! Never minding!', next: 'gift' },
        gift: {
          t: 'Oh! Here — take these carrots for the party. I only licked one. Maybe two.',
          do: () => {
            if (!BB.S.flags.bunGift) {
              G().flag('bunGift');
              G().addCarrots(3, document.querySelector('[data-actor="bun"]') || document.getElementById('carrot-pill'));
            }
          },
          next: 'end',
        },
      },
    },
    again: {
      id: 'bun_again',
      start: 'a',
      nodes: {
        a: {
          t: 'Have you ever looked at a cloud and it looked like a muffin? That one looks like a muffin.',
          choices: [
            { l: 'Any tips for me?', next: 'tip' },
            { l: 'Focus, Bun!', next: 'focus' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        tip: {
          t: () => {
            const h = G().hint();
            return `Hmm… Hazel says: “${h.text}.” She wrote it on my paw so I wouldn’t forget. I only licked half of it.`;
          },
          next: 'end',
        },
        focus: bye('I AM focused. On the muffin cloud.'),
        bye: bye('Bye! Bring muffins! Or clouds!'),
      },
    },
    party: {
      id: 'bun_party',
      start: 'a',
      nodes: { a: bye('Is it time to hide? I’m VERY good at hiding. You found me in two seconds, but that was a practice round.') },
    },
  };

  /* ---------------- MAX — Lisa's best friend, great at secrets ---------------- */
  const MAX = {
    hello: {
      id: 'max_hello',
      start: 'a',
      nodes: {
        a: { t: "Hey there. I'm Max — Lisa's best friend. Officially, I'm on secret-keeping duty.", next: 'b' },
        b: {
          t: 'Lisa thinks I’m helping Hazel alphabetize the carrot cellar today. She totally believed it.',
          choices: [
            { l: 'What does Lisa like?', next: 'likes' },
            { l: 'Can you keep a secret?', next: 'secret' },
          ],
        },
        secret: { t: 'I’ve known about this party for three weeks and haven’t said a word. I’m a vault. A fluffy vault.', next: 'likes' },
        likes: {
          t: 'Lisa loves chocolate. And she definitely likes lots of sprinkles. The more sprinkles, the bigger the smile.',
          do: () => G().flag('maxTip'),
          next: 'c',
        },
        c: bye('When everything’s ready, come find me. I’ll take care of the surprise part.'),
      },
    },
    again: {
      id: 'max_again',
      start: 'a',
      nodes: {
        a: {
          t: 'Lisa just messaged me: “why does the whole burrow smell like cake?” I said “coincidence.”',
          choices: [
            { l: 'Tell me more about Lisa.', next: 'more' },
            { l: 'What does Lisa like again?', next: 'likes' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        more: bye('She draws all the time — sketchbooks full of flowers and bunnies. She wants to illustrate storybooks someday.'),
        likes: { t: 'Chocolate. Lots of sprinkles. Warm sunset colours. And her friends — even Milo.', do: () => G().flag('maxTip'), next: 'end' },
        bye: bye('See you. Remember: act natural.'),
      },
    },
    surprise: {
      id: 'max_surprise',
      start: 'a',
      nodes: {
        a: { t: 'Wow. Look at this place. She’s going to lose her mind — in a good way.', next: 'b' },
        b: { t: 'I told Lisa to come to the Party Room for a “very boring clipboard meeting.” She’ll be here any minute!', next: 'c' },
        c: {
          t: 'Before she arrives — what should our group present be?',
          choices: [
            { l: 'A sketchbook and fancy pencils', next: 'g1', do: (s) => (s.surprise.gift = 'sketchbook') },
            { l: 'A giant carrot', next: 'g2', do: (s) => (s.surprise.gift = 'carrot') },
            { l: 'A cozy orange scarf', next: 'g3', do: (s) => (s.surprise.gift = 'scarf') },
          ],
        },
        g1: { t: 'Perfect. She’ll fill it in a week.', next: 'hide' },
        g2: { t: 'Bold. Classic. Milo’s influence, I assume. …Honestly? She’ll love it.', next: 'hide' },
        g3: { t: 'Ooh. It matches her whole vibe. She’ll wear it every day.', next: 'hide' },
        hide: {
          t: 'Now the most important part: everyone needs to HIDE! Tap each bunny to send them to a hiding spot. I’ll get the lights.',
          next: 'end',
        },
      },
      onEnd: (s) => {
        if (!s.surprise.gift) s.surprise.gift = 'sketchbook';
        s.surprise.hiding = true;
        BB.game.changed();
        if (BB.party) BB.party.startHiding();
      },
    },
    hiding: {
      id: 'max_hiding',
      start: 'a',
      nodes: { a: bye('Quick — tap the others to hide them! I’m on light-switch duty.') },
    },
  };

  /* ---------------- SHOPKEEPER BRAMBLE — cheerful & business-minded ---------------- */
  const SHOP = {
    hello: {
      id: 'shop_hello',
      start: 'a',
      nodes: {
        a: {
          t: 'Welcome to the Carrot Market! Looking for something special for a birthday?',
          choices: [
            { l: "It's Lisa's 16th birthday!", next: 'lisa' },
            { l: 'Do you take carrots?', next: 'take' },
            { l: 'Just browsing.', next: 'how' },
          ],
        },
        lisa: { t: 'Lisa? The sweet bunny who painted my shop sign? Then only the finest goods for her party!', next: 'how' },
        take: { t: 'Do I take carrots? Friend, I take ONLY carrots. Crunchy commerce!', next: 'how' },
        how: bye('Tap anything on the shelves for a closer look. Items with a ★ tag are on your party list!'),
      },
    },
    again: {
      id: 'shop_again',
      start: 'a',
      nodes: {
        a: {
          t: 'Back again! Business is blooming.',
          choices: [
            { l: 'Where can I find more carrots?', next: 'where' },
            { l: "How's business?", next: 'biz' },
            { l: 'Bye!', next: 'bye' },
          ],
        },
        where: bye('The garden’s full of them. Milo keeps “hiding” them in bushes. And trees, somehow.'),
        biz: bye('Carrot-tastic! Well. Carrot-adequate.'),
        bye: bye('Come again! And tell Lisa happy birthday from me — tomorrow! Shh!'),
      },
    },
    after: {
      id: 'shop_after',
      start: 'a',
      nodes: { a: bye('I heard the party was a smash hit! Lisa came by to show me her birthday photos. Best business day ever.') },
    },
  };

  /* ---------------- LISA — only after the surprise ---------------- */
  const LISA = {
    party: {
      id: 'lisa_party',
      start: 'a',
      nodes: {
        a: {
          t: 'I still can’t believe you all kept this a secret! Max, you told me it was a CLIPBOARD MEETING.',
          choices: [
            { l: 'Happy birthday, Lisa!', next: 'hb' },
            { l: 'Did you like the cake?', next: 'cake' },
            { l: 'How does it feel to be 16?', next: 'age' },
          ],
        },
        hb: bye('Thank you! This is the best birthday ever. Seriously. I’m going to draw this whole party in my sketchbook.'),
        cake: bye(() =>
          BB.S.cake.frosting === 'chocolate' && BB.S.cake.sprinkles >= 8
            ? 'Chocolate AND a mountain of sprinkles?! You know me so well. I had three slices. Don’t tell Poppy. (Tell Poppy.)'
            : 'It was delicious! Poppy says you did most of the mixing. Your stirring arm must be SO strong.'
        ),
        age: bye('Honestly? Exactly like fifteen, but with more cake and way more confetti in my ears.'),
      },
    },
  };

  const FIN = {
    hazel: 'hazel_done',
    poppy: { id: 'poppy_fin', start: 'a', nodes: { a: bye('Three slices of cake gone already! Lisa, Milo, and… me. I’m allowed. I’m the baker.') } },
    coco: { id: 'coco_fin', start: 'a', nodes: { a: bye('Lisa said the room looks like a sunset. A SUNSET. I’m putting that on my business card.') } },
    milo: { id: 'milo_fin', start: 'a', nodes: { a: bye('Lisa hugged me first. Well, fourth. But it FELT like first.') } },
    bun: { id: 'bun_fin', start: 'a', nodes: { a: bye('I ate zero muffins. …Okay, one. The one with the star. It was calling to me.') } },
    max: { id: 'max_fin', start: 'a', nodes: { a: bye('Look at her smile. Totally worth three weeks of keeping a secret. Thank you for helping.') } },
  };

  /** Pick the conversation for a character based on the game state. */
  BB.talk = function (id) {
    const s = BB.S;
    const g = BB.game;
    const ready = g.readyForSurprise();
    let convo;
    if (s.finished && FIN[id]) convo = typeof FIN[id] === 'string' ? HAZEL.done : FIN[id];
    else if (id === 'lisa') convo = LISA.party;
    else if (id === 'hazel') convo = !s.flags.plan ? HAZEL.intro : ready ? HAZEL.ready : HAZEL.check;
    else if (id === 'poppy') {
      if (ready) convo = s.talked.poppy ? POPPY.party : POPPY.hello;
      else if (!s.convos.poppy_hello) convo = POPPY.hello;
      else if (!s.cake.done) convo = g.hasAll(BB.CAKE_ITEMS) ? POPPY.ready : POPPY.wait;
      else if (!s.muffins.done) convo = POPPY.muffins;
      else convo = POPPY.done;
    } else if (id === 'coco') {
      if (!s.convos.coco_hello) convo = COCO.hello;
      else convo = g.taskDone('decorate') ? COCO.done : COCO.working;
    } else if (id === 'milo') {
      if (!s.convos.milo_hello) convo = MILO.hello;
      else convo = g.where('milo') === 'party' ? MILO.party : MILO.again;
    } else if (id === 'bun') {
      if (!s.convos.bun_found) convo = BUN.found;
      else convo = ready ? BUN.party : BUN.again;
    } else if (id === 'max') {
      if (ready) convo = s.surprise.hiding ? MAX.hiding : MAX.surprise;
      else convo = s.convos.max_hello ? MAX.again : MAX.hello;
    } else if (id === 'shop') {
      convo = s.finished ? SHOP.after : s.convos.shop_hello ? SHOP.again : SHOP.hello;
    }
    if (!convo) return Promise.resolve(false);
    return BB.dialogue.open(id, convo);
  };

  /** Does this character have something new (not yet completed) to say? */
  BB.hasNews = function (id) {
    const s = BB.S;
    const g = BB.game;
    if (s.finished || s.surprise.hiding) return false;
    const ready = g.readyForSurprise();
    switch (id) {
      case 'hazel': return !s.flags.plan || (ready && !s.convos.hazel_ready);
      case 'poppy':
        if (!s.convos.poppy_hello) return true;
        if (!s.cake.done && g.hasAll(BB.CAKE_ITEMS)) return true;
        return s.cake.done && !s.muffins.done && g.hasAll(BB.MUFFIN_ITEMS);
      case 'coco': return !s.convos.coco_hello;
      case 'milo': return !s.convos.milo_hello || (g.where('milo') === 'party' && !s.convos.milo_party);
      case 'bun': return !s.convos.bun_found;
      case 'max': return !s.convos.max_hello || (ready && !s.surprise.hiding);
      case 'shop': return !s.convos.shop_hello;
    }
    return false;
  };
})(window.BB);
