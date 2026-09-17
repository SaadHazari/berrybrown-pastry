/**
 * Every image and video on the site is listed here.
 *
 * `placeholder: true` marks free stock media (Unsplash / Mixkit licence) standing in
 * for Safa's own photos. To swap one: drop the new file in /public/images (or
 * /public/videos), change `src`, and set `placeholder` to false.
 */
export type Media = { src: string; alt: string; placeholder?: boolean };

const img = (file: string, alt: string, placeholder = false): Media => ({
  src: `/images/${file}`,
  alt,
  placeholder,
});

export const media = {
  logo: img('berrybrown_logo.webp', 'Berry Brown hand-drawn cake slice logo'),

  hero: {
    video: { src: '/videos/hero-drip.mp4', alt: 'Chocolate being drizzled over a berry layer cake', placeholder: true },
    poster: img('hero-poster.webp', 'Chocolate being drizzled over a berry layer cake', true),
  },

  craft: {
    video: { src: '/videos/craft-scraper.mp4', alt: 'Smoothing buttercream on a cake', placeholder: true },
    poster: img('craft-poster.webp', 'Smoothing buttercream on a cake', true),
  },

  chef: img('chef_safa_portrait.webp', 'Chef Safa piping cream in her kitchen', true),

  products: {
    chocolateDrip: img('chocolate-drip-cake.webp', 'Chocolate drip cake with piped chocolate swirls', true),
    pistachioKunafa: img('pistachio_kunafa_cake.webp', 'Pistachio cake with golden kunafa', true),
    creamSponge: img('cream-berry-sponge.webp', 'Layered cream sponge topped with berries', true),
    caramelChocolate: img('valrhona_chocolate_entremet.webp', 'Glossy chocolate caramel cake', true),
    blueberryCheesecake: img('blueberry-cheesecake-table.webp', 'Blueberry topped cheesecakes on a table', true),
    charlotte: img('berry_charlotte_cake.webp', 'Charlotte cake tied with ribbon and topped with berries', true),
    celebration: img('celebration_bespoke_cake.webp', 'Tiered celebration cake with flowers', true),
    mangoTart: img('exotic_mango_tart.webp', 'Mango rose tart', true),
    citrusTart: img('citrus-almond-tart.webp', 'Citrus tart with almonds', true),
  },

  gallery: {
    berrySlice: img('berry-layer-slice.webp', 'A slice of berry layer cake', true),
    pistachioSlice: img('pistachio-raspberry-slice.webp', 'Pistachio and raspberry cake slice', true),
    chocolateSlice: img('chocolate-slice-fork.webp', 'Fork in a slice of chocolate cake', true),
    rusticCake: img('rustic-sugar-cake.webp', 'Sugar-dusted cake on a wooden table', true),
    kneading: img('kneading-dough.webp', 'Hands kneading dough on a floured table', true),
    tartDisplay: img('fruit-tart-display.webp', 'Fresh fruit tarts in a display', true),
    coffee: img('coffee-and-pastries.webp', 'Coffee and pastries on a tray', true),
    birthday: img('birthday-cake-hand.webp', 'Birthday cake with candles held outdoors', true),
  },
};
