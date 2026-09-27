/**
 * Every photo slot on the page is listed here — twelve, and that is the budget forever.
 *
 * Until Safa's real photos exist, every slot renders the Rose placeholder panel
 * (`placeholder: true`). To swap one in: put the file in /public/images with the
 * same name, keep the 4:5 ratio, and set `placeholder` to false.
 */
export type Media = { src: string; alt: string; label: string; placeholder: boolean };

const slot = (file: string, alt: string, label: string): Media => ({
  src: `/images/${file}`,
  alt,
  label,
  placeholder: true,
});

export const media = {
  /** Hero, right column. */
  hero: slot('bb-the-six-01.jpg', 'Classic chocolate, one of the Six', 'THE SIX · CLASSIC CHOCOLATE'),

  /** The Six cards, in catalogue order. */
  six: [
    slot('bb-the-six-01.jpg', 'Berry Chocolate Drip', 'THE SIX · 1 OF 6'),
    slot('bb-the-six-02.jpg', 'Pistachio Kunafa', 'THE SIX · 2 OF 6'),
    slot('bb-the-six-03.jpg', 'Berry Cream Sponge', 'THE SIX · 3 OF 6'),
    slot('bb-the-six-04.jpg', 'Salted Caramel Chocolate', 'THE SIX · 4 OF 6'),
    slot('bb-the-six-05.jpg', 'Blueberry Cheesecake', 'THE SIX · 5 OF 6'),
    slot('bb-the-six-06.jpg', 'Vanilla Berry Charlotte', 'THE SIX · 6 OF 6'),
  ],

  /** Chef Safa section. */
  safa: slot('bb-safa.jpg', "Chef Safa's hands at work", 'HANDS'),

  /** The log, newest first. */
  log: [
    slot('bb-log-041.jpg', 'Cake number 41', '#041'),
    slot('bb-log-040.jpg', 'Cake number 40', '#040'),
    slot('bb-log-039.jpg', 'Cake number 39', '#039'),
  ],

  /** Custom-cake summary card. */
  custom: slot('bb-custom.jpg', 'A custom cake in the making', 'THE ONE WE MAKE FOR YOU'),
};

/** Flat list of all slots — used by the README check and tests. */
export const ALL_MEDIA: Media[] = [media.hero, ...media.six, media.safa, ...media.log, media.custom];
