import { cartManager } from './cartManager.js';
import { CONTACT_CONFIG } from '../data/dubaiZones.js';

export function initNavigation() {
  const header = document.querySelector('.site-header');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartBadge = document.getElementById('cart-badge');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');

  // Header Scroll Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      mobileToggle.textContent = mainNav.classList.contains('open') ? '✕' : '☰';
    });

    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mobileToggle.textContent = '☰';
      });
    });
  }

  // Cart Drawer Open / Close
  if (cartToggleBtn && cartDrawerOverlay) {
    cartToggleBtn.addEventListener('click', () => {
      cartDrawerOverlay.classList.add('open');
    });
  }

  if (cartCloseBtn && cartDrawerOverlay) {
    cartCloseBtn.addEventListener('click', () => {
      cartDrawerOverlay.classList.remove('open');
    });
  }

  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) {
        cartDrawerOverlay.classList.remove('open');
      }
    });
  }

  // Reactively render cart drawer when state changes
  cartManager.subscribe((state) => {
    // Update Badge
    if (cartBadge) {
      cartBadge.textContent = state.count;
      cartBadge.style.display = state.count > 0 ? 'flex' : 'none';
    }

    renderCartDrawer(state);
  });

  function renderCartDrawer(state) {
    const listEl = document.getElementById('cart-items-list');
    const footerEl = document.getElementById('cart-footer');
    const meterBox = document.getElementById('delivery-meter-box');
    const cartCountTitle = document.getElementById('cart-item-count-title');

    if (cartCountTitle) {
      cartCountTitle.textContent = `(${state.count} items)`;
    }

    // Delivery meter
    if (meterBox) {
      const remainingForFree = Math.max(0, state.zone.freeThreshold - state.subtotal);
      const percent = Math.min(100, Math.round((state.subtotal / state.zone.freeThreshold) * 100));

      if (state.isDeliveryFree || state.zone.fee === 0) {
        meterBox.innerHTML = `
          <div>🎉 You've unlocked <strong>FREE Delivery</strong> for ${state.zone.name}!</div>
          <div class="meter-bar"><div class="meter-fill" style="width: 100%;"></div></div>
        `;
      } else {
        meterBox.innerHTML = `
          <div>Add <strong>${cartManager.formatPrice(remainingForFree)}</strong> more for <strong>FREE Delivery</strong> across ${state.zone.name}</div>
          <div class="meter-bar"><div class="meter-fill" style="width: ${percent}%;"></div></div>
        `;
      }
    }

    if (!listEl) return;

    if (state.items.length === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">✧</div>
          <h4 style="font-family: var(--font-serif); font-size: 1.35rem; margin-bottom: 0.5rem; color: var(--color-berry-900);">Your Bag is Empty</h4>
          <p style="font-size: 0.88rem; margin-bottom: 1.5rem;">Explore Chef Safa's signature artisanal creations crafted fresh to order.</p>
          <button class="btn btn-gold btn-sm" id="cart-explore-btn">Explore Creations</button>
        </div>
      `;

      const exploreBtn = listEl.querySelector('#cart-explore-btn');
      if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
          cartDrawerOverlay.classList.remove('open');
          document.getElementById('creations')?.scrollIntoView({ behavior: 'smooth' });
        });
      }

      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (footerEl) footerEl.style.display = 'flex';

    listEl.innerHTML = state.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <div class="cart-item-header">
            <h5 class="cart-item-name">${item.name}</h5>
            <button class="cart-item-remove" data-key="${item.key}" aria-label="Remove item">✕</button>
          </div>
          <div class="cart-item-meta">${item.sizeLabel} • ${item.flavor}</div>
          ${item.plaque ? `<div class="cart-item-plaque">Inscription: "${item.plaque}"</div>` : ''}
          <div class="cart-item-footer">
            <div class="cart-qty-control">
              <button class="qty-btn btn-qty-minus" data-key="${item.key}">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn btn-qty-plus" data-key="${item.key}">+</button>
            </div>
            <div class="cart-item-price">${cartManager.formatPrice(item.price * item.quantity)}</div>
          </div>
        </div>
      </div>
    `).join('');

    // Update Totals
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const deliveryEl = document.getElementById('cart-delivery-val');
    const totalEl = document.getElementById('cart-total-val');

    if (subtotalEl) subtotalEl.textContent = cartManager.formatPrice(state.subtotal);
    if (deliveryEl) {
      deliveryEl.textContent = state.deliveryFee === 0 ? 'FREE' : cartManager.formatPrice(state.deliveryFee);
    }
    if (totalEl) totalEl.textContent = cartManager.formatPrice(state.total);

    // Event listeners on items
    listEl.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => cartManager.removeItem(btn.dataset.key));
    });

    listEl.querySelectorAll('.btn-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => cartManager.updateQuantity(btn.dataset.key, -1));
    });

    listEl.querySelectorAll('.btn-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => cartManager.updateQuantity(btn.dataset.key, 1));
    });

    // WhatsApp Instant Order button
    const waQuickBtn = document.getElementById('cart-wa-quick-btn');
    if (waQuickBtn) {
      waQuickBtn.href = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${cartManager.getWhatsAppOrderMessage()}`;
    }
  }
}
