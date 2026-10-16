import { describe, expect, it } from 'vitest';
import { CUSTOMISED, CUSTOM_STEPS, EMPTY_CUSTOM, FLAVOURS, LOOKS, OCCASIONS, SIZES, customAnswers, customFromPrice, customSummary, earliestCustomDate, isStepDone, remaining, ticketImage, validateCustom } from './custom';
import { media } from './media';

const earliest = '2026-10-04';
const full = { ...EMPTY_CUSTOM, occasion: 'birthday', serves: '6in', look: 'floral', flavour: 'chocolate', date: '2026-10-05' };

describe('custom cake form', () => {
  it('offers three choices plus Customised in every group, and the six signature flavours', () => {
    for (const list of [OCCASIONS, SIZES, LOOKS, FLAVOURS]) expect(list.at(-1)?.id).toBe(CUSTOMISED);
    for (const list of [OCCASIONS, SIZES]) expect(list).toHaveLength(4);
    expect(LOOKS.map((l) => l.label)).toEqual(['Vintage piping', 'Floral whimsy', 'Bedazzled', 'Customised']);
    expect(FLAVOURS).toHaveLength(7);
  });

  it('asks six questions in order', () => {
    expect(CUSTOM_STEPS.map((s) => s.id)).toEqual(['occasion', 'serves', 'look', 'flavour', 'words', 'date']);
  });

  it('needs a week', () => {
    expect(earliestCustomDate(new Date(2026, 8, 27, 10))).toBe('2026-10-04');
  });

  it('prices from the size, plus 60 for a custom flavour', () => {
    expect(customFromPrice(EMPTY_CUSTOM)).toBe(300);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: '7in' })).toBe(420);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: 'tiers' })).toBe(850);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: CUSTOMISED })).toBe(300);
    expect(customFromPrice({ ...EMPTY_CUSTOM, serves: '7in', flavour: CUSTOMISED })).toBe(480);
  });

  it('marks a step done only when answered, and Customised only with its text', () => {
    expect(isStepDone('occasion', EMPTY_CUSTOM, earliest)).toBe(false);
    expect(isStepDone('occasion', { ...EMPTY_CUSTOM, occasion: CUSTOMISED }, earliest)).toBe(false);
    expect(isStepDone('occasion', { ...EMPTY_CUSTOM, occasion: CUSTOMISED, occasionOther: 'Graduation' }, earliest)).toBe(true);
    expect(isStepDone('words', EMPTY_CUSTOM, earliest)).toBe(true);
    expect(isStepDone('date', { ...EMPTY_CUSTOM, date: '2026-10-03' }, earliest)).toBe(false);
    expect(remaining(EMPTY_CUSTOM, earliest)).toBe(5);
    expect(remaining(full, earliest)).toBe(0);
  });

  it('validates every required answer and refuses typed dates inside the week', () => {
    expect(Object.keys(validateCustom(EMPTY_CUSTOM, earliest)).sort()).toEqual(['date', 'flavour', 'look', 'occasion', 'serves']);
    const custom = { ...full, occasion: CUSTOMISED, serves: CUSTOMISED, look: CUSTOMISED, flavour: CUSTOMISED };
    expect(Object.keys(validateCustom(custom, earliest)).sort()).toEqual(['flavourOther', 'lookOther', 'occasionOther', 'servesOther']);
    expect(validateCustom({ ...full, date: '2026-10-03' }, earliest).date).toBe('Custom cakes need a week');
    expect(validateCustom({ ...full, words: 'x'.repeat(36) }, earliest).words).toBeTruthy();
    expect(validateCustom(full, earliest)).toEqual({});
  });

  it('summarises the answers, using Customised text only when Customised is picked', () => {
    const rows = customSummary({ ...full, occasion: CUSTOMISED, occasionOther: 'Graduation', words: ' Well done ' });
    expect(rows.map((r) => r.label)).toEqual(['Occasion', 'People', 'Look', 'Flavour', 'Words', 'Date']);
    expect(rows.map((r) => r.value)).toEqual(['Graduation', '6–8 people · 6 inch', 'Floral whimsy', 'Classic chocolate', 'Well done', '2026-10-05']);
    expect(customSummary({ ...full, occasionOther: 'Stale text' })[0].value).toBe('Birthday');
    expect(customSummary({ ...full, noWords: true })[4].value).toBe('No words');
  });

  it('shows the photo of the chosen look, and no photo before one is picked', () => {
    expect(ticketImage(EMPTY_CUSTOM)).toBeNull();
    expect(ticketImage({ ...EMPTY_CUSTOM, look: 'bedazzled' })).toBe(media.looks.drip);
    expect(ticketImage({ ...EMPTY_CUSTOM, look: CUSTOMISED })).toBe(media.looks.custom);
  });

  it('turns the answers into strings for the enquiry log', () => {
    expect(customAnswers({ ...full, noWords: true }).noWords).toBe('yes');
    expect(customAnswers(full).noWords).toBe('');
    expect(customAnswers(full).serves).toBe('6in');
  });
});
