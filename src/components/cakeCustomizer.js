import { CONTACT_CONFIG } from '../data/dubaiZones.js';

export function initCakeCustomizer() {
  const customizerSection = document.getElementById('bespoke-customizer');
  if (!customizerSection) return;

  const state = {
    occasion: 'Milestone Birthday',
    tiers: '2-Tier (25–35 guests)',
    style: 'Deckled 24k Gold Leaf & Ivory Buttercream',
    flavor: 'Madagascar Vanilla & Strawberry Champagne Confit',
    notes: '',
    tierMultiplier: 1.0,
    baseEstimateLow: 850,
    baseEstimateHigh: 1250,
    leadDays: '3–5 days'
  };

  const TIERS_CONFIG = {
    '1-Tier (12–16 guests)': { low: 480, high: 680, lead: '48h notice' },
    '2-Tier (25–35 guests)': { low: 850, high: 1250, lead: '3–5 days notice' },
    '3-Tier (50–70 guests)': { low: 1450, high: 2100, lead: '5–7 days notice' },
    '4-Tier Luxe (80–120+ guests)': { low: 2400, high: 3600, lead: '7–10 days notice' }
  };

  const STYLE_MULTIPLIERS = {
    'Deckled 24k Gold Leaf & Ivory Buttercream': 1.0,
    'Chocolate Velvet Spray & Fresh Berry Cascade': 1.05,
    'Haute Floral Garden & French Macarons': 1.15,
    'Modern Royal Lambeth Vintage Piping': 1.1
  };

  function updatePreview() {
    const tierData = TIERS_CONFIG[state.tiers] || TIERS_CONFIG['2-Tier (25–35 guests)'];
    const styleMult = STYLE_MULTIPLIERS[state.style] || 1.0;

    const lowPrice = Math.round(tierData.low * styleMult);
    const highPrice = Math.round(tierData.high * styleMult);

    const specOccasion = document.getElementById('spec-occasion');
    const specTiers = document.getElementById('spec-tiers');
    const specStyle = document.getElementById('spec-style');
    const specFlavor = document.getElementById('spec-flavor');
    const specNotice = document.getElementById('spec-notice');
    const priceDisplay = document.getElementById('preview-price-range');

    if (specOccasion) specOccasion.textContent = state.occasion;
    if (specTiers) specTiers.textContent = state.tiers;
    if (specStyle) specStyle.textContent = state.style;
    if (specFlavor) specFlavor.textContent = state.flavor;
    if (specNotice) specNotice.textContent = tierData.lead;
    if (priceDisplay) {
      priceDisplay.innerHTML = `<span>AED</span>${lowPrice.toLocaleString()} – ${highPrice.toLocaleString()}`;
    }

    // Update WhatsApp link
    const waBtn = document.getElementById('customizer-whatsapp-btn');
    if (waBtn) {
      const msg = `*BESPOKE CAKE CONSULTATION INQUIRY*\n` +
        `Hello Chef Safa, I would like to consult on a custom cake for my upcoming event:\n\n` +
        `• *Occasion:* ${state.occasion}\n` +
        `• *Size / Tiers:* ${state.tiers}\n` +
        `• *Finishing Style:* ${state.style}\n` +
        `• *Preferred Flavor:* ${state.flavor}\n` +
        `• *Estimated Budget Range:* AED ${lowPrice} - AED ${highPrice}\n` +
        (state.notes ? `• *Special Notes:* ${state.notes}\n` : '') +
        `\nCould you please let me know your atelier availability for this date? Thank you!`;

      waBtn.href = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
    }
  }

  // Bind Choice Pills
  customizerSection.querySelectorAll('.choice-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const group = pill.closest('.choice-pills-wrap');
      const param = group.dataset.param;
      if (!param) return;

      group.querySelectorAll('.choice-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');

      state[param] = pill.textContent.trim();
      updatePreview();
    });
  });

  const notesInput = document.getElementById('customizer-notes-input');
  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      state.notes = e.target.value.trim();
      updatePreview();
    });
  }

  // Initial calculation
  updatePreview();
}
