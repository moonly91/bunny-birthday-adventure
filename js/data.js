/* Bunny Birthday Adventure — data.js
   Static game data: items, locations and characters. */
(function (BB) {
  'use strict';

  BB.ITEMS = {
    flour: { name: 'Flour', price: 3, use: 'cake', desc: 'Soft, fluffy, and it gets absolutely everywhere.' },
    eggs: { name: 'Eggs', price: 2, use: 'cake', desc: 'Two farm-fresh eggs. Handle with care!' },
    milk: { name: 'Milk', price: 2, use: 'cake', desc: 'Creamy milk for an extra-fluffy sponge.' },
    butter: { name: 'Butter', price: 2, use: 'cake', desc: 'Golden butter. The secret to every good cake.' },
    chocolate: { name: 'Chocolate', price: 4, use: 'cake', desc: 'Rich dark chocolate. Rumour has it Lisa LOVES this.' },
    sprinkles: { name: 'Sprinkles', price: 3, use: 'cake', desc: 'A jar of rainbow sprinkles. Joy, in tiny pieces.' },
    candles: { name: 'Birthday Candles', price: 2, use: 'cake', desc: 'Number candles: a 1 and a 6. Very important numbers.' },
    cups: { name: 'Muffin Cups', price: 1, use: 'muffins', desc: 'Six pleated paper cups, perfectly muffin-sized.' },
    chips: { name: 'Chocolate Chips', price: 3, use: 'muffins', desc: 'Tiny chocolate drops for tiny delicious muffins.' },
    balloons: { name: 'Balloons', price: 3, decor: true, desc: 'A bouquet of orange, pink and yellow balloons.' },
    banner: { name: 'Birthday Banner', price: 5, decor: true, desc: 'A hand-lettered HAPPY BIRTHDAY LISA banner.' },
    flowers: { name: 'Flowers', price: 3, decor: true, desc: 'Sunny blooms in a little blue vase.' },
    hats: { name: 'Party Hats', price: 2, decor: true, desc: 'Pointy hats with pompoms. Mandatory fun.' },
    confetti: { name: 'Confetti', price: 2, decor: true, desc: "A bag of confetti. Cleanup is future-bunny's problem." },
    gift: { name: 'Gift Box', price: 4, decor: true, desc: 'A beautifully wrapped present with a big bow.' },
    bows: { name: 'Table Bows', price: 2, decor: true, desc: 'Pink ribbon bows to make the table extra cute.' },
    lights: { name: 'Fairy Lights', price: 3, decor: true, desc: 'Twinkly string lights. Instant cozy.' },
    table: { name: 'Cake Table', price: 0, decor: true, free: true, desc: "Coco's round table with a lacy cloth. From storage — free!" },
    chairs: { name: 'Chairs', price: 0, decor: true, free: true, desc: 'Two cushioned chairs from the storage closet. Free!' },
  };

  BB.CAKE_ITEMS = ['flour', 'eggs', 'milk', 'butter', 'chocolate', 'sprinkles', 'candles'];
  BB.MUFFIN_ITEMS = ['cups', 'chips'];
  BB.DECOR_REQ = ['balloons', 'banner'];
  BB.SHOP_BAKING = ['flour', 'eggs', 'milk', 'butter', 'chocolate', 'sprinkles', 'cups', 'chips'];
  BB.SHOP_PARTY = ['balloons', 'banner', 'candles', 'flowers', 'hats', 'confetti', 'gift', 'bows', 'lights'];

  BB.LOCATIONS = {
    kitchen: { name: 'Kitchen', full: 'Bunny House Kitchen', icon: '🏠', blurb: 'Poppy’s cozy kitchen' },
    garden: { name: 'Garden', full: 'The Garden', icon: '🌷', blurb: 'Carrots, bushes & sunshine' },
    shop: { name: 'Shop', full: 'The Carrot Market', icon: '🛍️', blurb: 'Ingredients & decorations' },
    party: { name: 'Party Room', full: 'The Party Room', icon: '🎈', blurb: 'Where the magic happens' },
  };
  BB.LOC_ORDER = ['kitchen', 'garden', 'shop', 'party'];

  /** The six party bunnies the player must meet (Lisa & the shopkeeper are extra). */
  BB.PARTY_BUNNIES = ['hazel', 'poppy', 'coco', 'milo', 'bun', 'max'];

  BB.CHARS = {
    hazel: { name: 'Hazel', role: 'Party Planner', color: '#4f9a6a', pitch: 560 },
    poppy: { name: 'Poppy', role: 'The Baker', color: '#e8704f', pitch: 640 },
    coco: { name: 'Coco', role: 'Decoration Expert', color: '#e0508a', pitch: 700 },
    milo: { name: 'Milo', role: 'Helper (self-appointed)', color: '#3f7fc4', pitch: 500 },
    bun: { name: 'Bun', role: 'Snack Enthusiast', color: '#a47a52', pitch: 820 },
    max: { name: 'Max', role: 'Lisa’s Best Friend', color: '#2f8a7e', pitch: 400 },
    lisa: { name: 'Lisa', role: 'The Birthday Bunny', color: '#e39a00', pitch: 660 },
    shop: { name: 'Bramble', role: 'Shopkeeper', color: '#5f9446', pitch: 340 },
  };
})(window.BB);
