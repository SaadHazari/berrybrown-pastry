import { cartManager } from './cartManager.js';
import { DUBAI_ZONES, DELIVERY_TIME_SLOTS, CONTACT_CONFIG } from '../data/dubaiZones.js';
import { toast } from './toast.js';

export function initCheckout() {
  const checkoutDialog = document.getElementById('checkout-dialog');
  const openCheckoutBtn = document.getElementById('cart-checkout-btn');
  const closeCheckoutBtn = document.getElementById('checkout-close-btn');

  if (!checkoutDialog) return;

  let currentStep = 1;
  const orderData = {
    deliveryMode: 'delivery', // 'delivery' or 'pickup'
    zoneId: cartManager.selectedZoneId,
    zoneName: cartManager.getSelectedZone().name,
    date: '',
    timeSlot: DELIVERY_TIME_SLOTS[0].label,
    customer: {
      name: '',
      phone: '',
      email: ''
    },
    address: {
      unit: '',
      building: '',
      area: '',
      instructions: '',
      giftMessage: ''
    },
    paymentMethod: 'card', // 'card', 'applepay', 'cod', 'whatsapp'
    orderRef: ''
  };

  // Helper to set minimum delivery date (24h in advance)
  function getMinDeliveryDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow
    return d.toISOString().split('T')[0];
  }

  // Open checkout
  if (openCheckoutBtn) {
    openCheckoutBtn.addEventListener('click', () => {
      if (cartManager.getItemCount() === 0) {
        toast.show('Your bag is currently empty.', 'gold');
        return;
      }
      // Close cart drawer
      const cartDrawer = document.getElementById('cart-drawer-overlay');
      if (cartDrawer) cartDrawer.classList.remove('open');

      currentStep = 1;
      orderData.date = getMinDeliveryDate();
      renderStep(currentStep);
      checkoutDialog.showModal();
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
      checkoutDialog.close();
    });
  }

  function renderStep(step) {
    currentStep = step;
    updateStepIndicators();

    const body = checkoutDialog.querySelector('.checkout-body');
    if (!body) return;

    const cartState = cartManager.getState();

    if (step === 1) {
      body.innerHTML = `
        <div class="step-panel active">
          <h3 class="step-heading">1. Delivery Schedule & Location</h3>
          <p class="step-subtext">All creations are chilled and hand-transported in temperature-controlled vehicles across Dubai.</p>

          <div class="radio-cards-grid">
            <div class="radio-card ${orderData.deliveryMode === 'delivery' ? 'selected' : ''}" id="mode-delivery">
              <input type="radio" name="delivery-mode" value="delivery" ${orderData.deliveryMode === 'delivery' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div class="radio-card-title">Chilled Dubai Delivery</div>
                <div class="radio-card-desc">Temperature-controlled van directly to your door</div>
              </div>
            </div>

            <div class="radio-card ${orderData.deliveryMode === 'pickup' ? 'selected' : ''}" id="mode-pickup">
              <input type="radio" name="delivery-mode" value="pickup" ${orderData.deliveryMode === 'pickup' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div class="radio-card-title">Studio Self-Collection</div>
                <div class="radio-card-desc">Pick up fresh at Al Quoz Pastry Studio (FREE)</div>
              </div>
            </div>
          </div>

          ${orderData.deliveryMode === 'delivery' ? `
            <div class="form-group">
              <label class="form-label" for="checkout-zone-select">Select Dubai Delivery Area / District:</label>
              <select id="checkout-zone-select" class="form-select">
                ${DUBAI_ZONES.filter(z => z.id !== 'studio-pickup').map(z => `
                  <option value="${z.id}" ${z.id === orderData.zoneId ? 'selected' : ''}>
                    ${z.name} — AED ${z.fee} ${cartState.subtotal >= z.freeThreshold ? '(FREE Delivery applied!)' : ''}
                  </option>
                `).join('')}
              </select>
            </div>
          ` : `
            <div style="background: var(--color-berry-50); border: 1px solid var(--color-border-gold); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
              <strong style="color: var(--color-berry-900);">Studio Address:</strong> ${CONTACT_CONFIG.studioLocation}<br/>
              <span style="font-size: 0.84rem; color: var(--color-text-muted);">Please bring your Order Reference upon collection. Packaged in a luxury insulated carrier bag.</span>
            </div>
          `}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="form-group">
              <label class="form-label" for="delivery-date-input">Desired Delivery Date:</label>
              <input type="date" id="delivery-date-input" class="form-input" min="${getMinDeliveryDate()}" value="${orderData.date}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="delivery-slot-select">Preferred 2h Time Slot:</label>
              <select id="delivery-slot-select" class="form-select">
                ${DELIVERY_TIME_SLOTS.map(slot => `
                  <option value="${slot.label}" ${slot.label === orderData.timeSlot ? 'selected' : ''}>${slot.label}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="checkout-order-summary">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.35rem;">
              <span>Subtotal (${cartState.count} items):</span>
              <strong>${cartManager.formatPrice(cartState.subtotal)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
              <span>Delivery Fee:</span>
              <strong style="color: ${cartState.deliveryFee === 0 ? '#27AE60' : 'var(--color-berry-900)'}">
                ${cartState.deliveryFee === 0 ? 'FREE' : cartManager.formatPrice(cartState.deliveryFee)}
              </strong>
            </div>
          </div>

          <div class="checkout-btn-row">
            <button class="btn btn-outline" id="btn-cancel-checkout">Cancel</button>
            <button class="btn btn-gold btn-lg" id="btn-to-step-2">Continue to Contact & Address →</button>
          </div>
        </div>
      `;

      bindStep1Events();
    } else if (step === 2) {
      body.innerHTML = `
        <div class="step-panel active">
          <h3 class="step-heading">2. Client Contact & Dubai Address</h3>
          <p class="step-subtext">We require contact details to coordinate real-time delivery concierge updates.</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label" for="customer-name">Full Name *</label>
              <input type="text" id="customer-name" class="form-input" placeholder="e.g. Layla Al Mansoori" value="${orderData.customer.name}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="customer-phone">UAE Mobile Number *</label>
              <input type="tel" id="customer-phone" class="form-input" placeholder="+971 50 000 0000" value="${orderData.customer.phone}" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="customer-email">Email Address (for invoice copy)</label>
            <input type="email" id="customer-email" class="form-input" placeholder="layla@example.com" value="${orderData.customer.email}" />
          </div>

          ${orderData.deliveryMode === 'delivery' ? `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="address-unit">Villa / Apt # *</label>
                <input type="text" id="address-unit" class="form-input" placeholder="Villa 14 or Apt 804" value="${orderData.address.unit}" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="address-building">Building / Community Name *</label>
                <input type="text" id="address-building" class="form-input" placeholder="e.g. Al Yass Tower / Dubai Hills" value="${orderData.address.building}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="address-instructions">
                <span>Gate Code / Delivery Instructions</span>
                <span class="form-label-hint">Optional</span>
              </label>
              <input type="text" id="address-instructions" class="form-input" placeholder="e.g. Gate code #4412, call upon arrival" value="${orderData.address.instructions}" />
            </div>
          ` : ''}

          <div class="form-group">
            <label class="form-label" for="address-gift-message">
              <span>Complimentary Handwritten Gift Card Note</span>
              <span class="form-label-hint">Optional</span>
            </label>
            <textarea id="address-gift-message" class="form-textarea" placeholder="Write a warm note to be penned on luxury gold-embossed cardstock...">${orderData.address.giftMessage}</textarea>
          </div>

          <div class="checkout-btn-row">
            <button class="btn btn-outline" id="btn-back-to-step-1">← Back</button>
            <button class="btn btn-gold btn-lg" id="btn-to-step-3">Continue to Payment →</button>
          </div>
        </div>
      `;

      bindStep2Events();
    } else if (step === 3) {
      body.innerHTML = `
        <div class="step-panel active">
          <h3 class="step-heading">3. Payment & Final Review</h3>
          <p class="step-subtext">Secure encrypted checkout. Choose your preferred settlement method.</p>

          <div class="radio-cards-grid" style="margin-bottom: 1.5rem;">
            <div class="radio-card ${orderData.paymentMethod === 'card' ? 'selected' : ''}" id="pay-card">
              <input type="radio" name="payment-method" value="card" ${orderData.paymentMethod === 'card' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div class="radio-card-title">Credit / Debit Card</div>
                <div class="radio-card-desc">Visa, Mastercard, American Express (UAE & Intl)</div>
              </div>
            </div>

            <div class="radio-card ${orderData.paymentMethod === 'applepay' ? 'selected' : ''}" id="pay-applepay">
              <input type="radio" name="payment-method" value="applepay" ${orderData.paymentMethod === 'applepay' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div class="radio-card-title">Apple Pay</div>
                <div class="radio-card-desc">Fast, secure one-touch payment</div>
              </div>
            </div>

            <div class="radio-card ${orderData.paymentMethod === 'cod' ? 'selected' : ''}" id="pay-cod">
              <input type="radio" name="payment-method" value="cod" ${orderData.paymentMethod === 'cod' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div class="radio-card-title">Card / Cash on Delivery</div>
                <div class="radio-card-desc">Pay via POS wireless terminal or cash at your door</div>
              </div>
            </div>

            <div class="radio-card ${orderData.paymentMethod === 'whatsapp' ? 'selected' : ''}" id="pay-whatsapp">
              <input type="radio" name="payment-method" value="whatsapp" ${orderData.paymentMethod === 'whatsapp' ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div class="radio-card-title">WhatsApp Direct Pay</div>
                <div class="radio-card-desc">Direct payment link generated with Chef Safa</div>
              </div>
            </div>
          </div>

          ${orderData.paymentMethod === 'card' ? `
            <div style="background: var(--color-ivory-50); padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid rgba(70, 20, 47, 0.12); margin-bottom: 1.5rem;">
              <div class="form-group">
                <label class="form-label">Card Number</label>
                <input type="text" class="form-input" placeholder="4000 1234 5678 9010" value="4000 •••• •••• 8821" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Expiry Date</label>
                  <input type="text" class="form-input" placeholder="MM/YY" value="08/28" />
                </div>
                <div class="form-group">
                  <label class="form-label">CVC / CVV</label>
                  <input type="text" class="form-input" placeholder="•••" value="732" />
                </div>
              </div>
              <div style="font-size: 0.76rem; color: #27AE60; display: flex; align-items: center; gap: 0.35rem;">
                🔒 256-Bit SSL Encrypted • 3D Secure UAE Central Bank Compliant
              </div>
            </div>
          ` : ''}

          <!-- Order Breakdown -->
          <div class="checkout-order-summary">
            <div style="font-weight: 700; color: var(--color-berry-900); margin-bottom: 0.5rem;">Order Summary</div>
            ${cartState.items.map(it => `
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
                <span>${it.quantity}x ${it.name} (${it.sizeLabel})</span>
                <span>${cartManager.formatPrice(it.price * it.quantity)}</span>
              </div>
            `).join('')}
            <div style="border-top: 1px solid rgba(70, 20, 47, 0.1); margin-top: 0.5rem; padding-top: 0.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span>Delivery:</span>
                <span>${cartState.deliveryFee === 0 ? 'FREE' : cartManager.formatPrice(cartState.deliveryFee)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700; color: var(--color-berry-900); margin-top: 0.4rem; font-family: var(--font-serif);">
                <span>Total:</span>
                <span>${cartManager.formatPrice(cartState.total)}</span>
              </div>
            </div>
          </div>

          <div class="checkout-btn-row">
            <button class="btn btn-outline" id="btn-back-to-step-2">← Back</button>
            <button class="btn btn-gold btn-lg" id="btn-place-order" style="min-width: 220px;">
              Confirm & Complete Order ✦
            </button>
          </div>
        </div>
      `;

      bindStep3Events();
    } else if (step === 4) {
      // Confirmation Screen
      body.innerHTML = `
        <div class="step-panel active confirmation-container">
          <div class="confirmation-icon">✓</div>
          <h2 style="font-size: 2rem; margin-bottom: 0.3rem;">Merci Beaucoup! Order Confirmed</h2>
          <p style="color: var(--color-text-muted); font-size: 0.95rem;">
            Chef Safa has received your commission and will begin artisanal preparation.
          </p>

          <div class="order-ref-badge">
            Reference: ${orderData.orderRef}
          </div>

          <div class="invoice-card">
            <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(70, 20, 47, 0.12); padding-bottom: 0.75rem;">
              <div>
                <strong style="color: var(--color-berry-900); font-size: 1.1rem; font-family: var(--font-serif);">BerryBrown Pâtisserie Atelier</strong>
                <div style="font-size: 0.76rem; color: var(--color-text-muted);">Dubai, United Arab Emirates</div>
              </div>
              <div style="text-align: right; font-size: 0.82rem; color: var(--color-text-muted);">
                Date: ${new Date().toLocaleDateString('en-GB')}<br/>
                Status: <strong>Confirmed & Scheduled</strong>
              </div>
            </div>

            <div style="margin-block: 1rem; font-size: 0.86rem; color: var(--color-text-body);">
              <strong>Recipient:</strong> ${orderData.customer.name} (${orderData.customer.phone})<br/>
              <strong>Schedule:</strong> ${orderData.date} • ${orderData.timeSlot}<br/>
              <strong>Destination:</strong> ${orderData.deliveryMode === 'pickup' ? 'Studio Collection' : `${orderData.address.unit}, ${orderData.address.building}, ${orderData.zoneName}`}
              ${orderData.address.giftMessage ? `<br/><strong>Gift Note:</strong> "${orderData.address.giftMessage}"` : ''}
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${cartState.items.map(it => `
                  <tr>
                    <td>
                      <strong>${it.name}</strong><br/>
                      <span style="font-size: 0.78rem; color: var(--color-text-muted);">${it.sizeLabel} • ${it.flavor}</span>
                      ${it.plaque ? `<br/><span style="font-size: 0.76rem; color: var(--color-berry-700); font-style: italic;">Plaque: "${it.plaque}"</span>` : ''}
                    </td>
                    <td style="text-align: center;">${it.quantity}</td>
                    <td style="text-align: right;">${cartManager.formatPrice(it.price * it.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="invoice-totals">
              <div class="invoice-row">
                <span>Subtotal:</span>
                <span>${cartManager.formatPrice(cartState.subtotal)}</span>
              </div>
              <div class="invoice-row">
                <span>Delivery:</span>
                <span>${cartState.deliveryFee === 0 ? 'FREE' : cartManager.formatPrice(cartState.deliveryFee)}</span>
              </div>
              <div class="invoice-row total">
                <span>Grand Total:</span>
                <span>${cartManager.formatPrice(cartState.total)}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; max-width: 420px; margin: 0 auto;">
            <a 
              href="https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${cartManager.getWhatsAppOrderMessage({
                orderRef: orderData.orderRef,
                customer: orderData.customer,
                delivery: {
                  zoneName: orderData.zoneName,
                  date: orderData.date,
                  timeSlot: orderData.timeSlot,
                  address: orderData.deliveryMode === 'pickup' ? 'Studio Pickup' : `${orderData.address.unit}, ${orderData.address.building}`,
                  instructions: orderData.address.instructions,
                  giftMessage: orderData.address.giftMessage
                }
              })}" 
              target="_blank" 
              class="btn btn-gold btn-lg" 
              style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.6rem;"
            >
              <span>Dispatch Order Details to Safa via WhatsApp 💬</span>
            </a>

            <button class="btn btn-outline" id="btn-print-receipt" style="width: 100%;">
              Print / Save PDF Receipt 🖨️
            </button>

            <button class="btn btn-primary" id="btn-finish-shopping" style="width: 100%;">
              Back to Creations
            </button>
          </div>
        </div>
      `;

      bindStep4Events();
    }
  }

  function updateStepIndicators() {
    const indicators = checkoutDialog.querySelectorAll('.step-indicator');
    indicators.forEach((ind, index) => {
      const stepNum = index + 1;
      ind.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        ind.classList.add('active');
      } else if (stepNum < currentStep) {
        ind.classList.add('completed');
      }
    });
  }

  function bindStep1Events() {
    const modeDelivery = checkoutDialog.querySelector('#mode-delivery');
    const modePickup = checkoutDialog.querySelector('#mode-pickup');

    if (modeDelivery && modePickup) {
      modeDelivery.addEventListener('click', () => {
        orderData.deliveryMode = 'delivery';
        cartManager.setSelectedZone(orderData.zoneId === 'studio-pickup' ? 'downtown-difc' : orderData.zoneId);
        renderStep(1);
      });
      modePickup.addEventListener('click', () => {
        orderData.deliveryMode = 'pickup';
        cartManager.setSelectedZone('studio-pickup');
        renderStep(1);
      });
    }

    const zoneSelect = checkoutDialog.querySelector('#checkout-zone-select');
    if (zoneSelect) {
      zoneSelect.addEventListener('change', (e) => {
        orderData.zoneId = e.target.value;
        const found = DUBAI_ZONES.find(z => z.id === e.target.value);
        if (found) orderData.zoneName = found.name;
        cartManager.setSelectedZone(e.target.value);
        renderStep(1);
      });
    }

    const dateInput = checkoutDialog.querySelector('#delivery-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        orderData.date = e.target.value;
      });
    }

    const slotSelect = checkoutDialog.querySelector('#delivery-slot-select');
    if (slotSelect) {
      slotSelect.addEventListener('change', (e) => {
        orderData.timeSlot = e.target.value;
      });
    }

    const btnCancel = checkoutDialog.querySelector('#btn-cancel-checkout');
    if (btnCancel) {
      btnCancel.addEventListener('click', () => checkoutDialog.close());
    }

    const btnNext = checkoutDialog.querySelector('#btn-to-step-2');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (!orderData.date) {
          toast.show('Please choose your delivery date.', 'gold');
          return;
        }
        renderStep(2);
      });
    }
  }

  function bindStep2Events() {
    const nameInput = checkoutDialog.querySelector('#customer-name');
    const phoneInput = checkoutDialog.querySelector('#customer-phone');
    const emailInput = checkoutDialog.querySelector('#customer-email');
    const unitInput = checkoutDialog.querySelector('#address-unit');
    const buildingInput = checkoutDialog.querySelector('#address-building');
    const instrInput = checkoutDialog.querySelector('#address-instructions');
    const giftInput = checkoutDialog.querySelector('#address-gift-message');

    const btnBack = checkoutDialog.querySelector('#btn-back-to-step-1');
    const btnNext = checkoutDialog.querySelector('#btn-to-step-3');

    if (btnBack) {
      btnBack.addEventListener('click', () => renderStep(1));
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const name = nameInput?.value.trim();
        const phone = phoneInput?.value.trim();

        if (!name || !phone) {
          toast.show('Please fill in your name and contact phone number.', 'gold');
          return;
        }

        if (orderData.deliveryMode === 'delivery') {
          const unit = unitInput?.value.trim();
          const bld = buildingInput?.value.trim();
          if (!unit || !bld) {
            toast.show('Please provide your villa/apartment number and building/community name.', 'gold');
            return;
          }
          orderData.address.unit = unit;
          orderData.address.building = bld;
          orderData.address.instructions = instrInput ? instrInput.value.trim() : '';
        }

        orderData.customer.name = name;
        orderData.customer.phone = phone;
        orderData.customer.email = emailInput ? emailInput.value.trim() : '';
        orderData.address.giftMessage = giftInput ? giftInput.value.trim() : '';

        renderStep(3);
      });
    }
  }

  function bindStep3Events() {
    ['pay-card', 'pay-applepay', 'pay-cod', 'pay-whatsapp'].forEach(id => {
      const card = checkoutDialog.querySelector(`#${id}`);
      if (card) {
        card.addEventListener('click', () => {
          const method = id.replace('pay-', '');
          orderData.paymentMethod = method;
          renderStep(3);
        });
      }
    });

    const btnBack = checkoutDialog.querySelector('#btn-back-to-step-2');
    if (btnBack) {
      btnBack.addEventListener('click', () => renderStep(2));
    }

    const btnPlace = checkoutDialog.querySelector('#btn-place-order');
    if (btnPlace) {
      btnPlace.addEventListener('click', () => {
        btnPlace.disabled = true;
        btnPlace.textContent = 'Securing Artisanal Commission...';

        setTimeout(() => {
          orderData.orderRef = `BB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          renderStep(4);
          toast.show(`Order <strong>${orderData.orderRef}</strong> placed successfully!`, 'success');
        }, 600);
      });
    }
  }

  function bindStep4Events() {
    const printBtn = checkoutDialog.querySelector('#btn-print-receipt');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    const finishBtn = checkoutDialog.querySelector('#btn-finish-shopping');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        cartManager.clearCart();
        checkoutDialog.close();
      });
    }
  }
}
