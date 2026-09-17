import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { cartManager } from './cartManager.js';
import { toast } from './toast.js';

export function initCatalog() {
  const container = document.getElementById('product-grid');
  const filtersContainer = document.getElementById('catalog-filters');
  const modal = document.getElementById('product-modal');

  if (!container || !modal) return;

  let currentCategory = 'all';
  let activeProduct = null;
  let selectedSize = null;
  let selectedFlavor = '';
  let plaqueText = '';
  let candleCount = 0;
  let orderQty = 1;

  // Render Filters
  if (filtersContainer) {
    filtersContainer.innerHTML = CATEGORIES.map(cat => `
      <button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
        ${cat.label}
      </button>
    `).join('');

    filtersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      
      filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderProducts();
    });
  }

  // Render Products Grid
  function renderProducts() {
    const filtered = currentCategory === 'all' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === currentCategory);

    container.innerHTML = filtered.map(product => {
      const defaultSize = product.sizes.find(s => s.default) || product.sizes[0];
      const dietaryTagsHtml = product.dietary.slice(0, 3).map(tag => `
        <span class="tag-pill">${tag}</span>
      `).join('');

      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="product-image-wrap">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" />
            <div class="product-badge-overlay">
              <span class="badge ${product.badge.includes('Dubai') ? 'badge-gold' : 'badge-berry'}">
                ${product.badge}
              </span>
            </div>
            <div class="product-quick-view-overlay">
              <button class="btn btn-gold btn-sm view-details-btn" data-product-id="${product.id}">
                Quick View & Order
              </button>
            </div>
          </div>
          
          <div class="product-content">
            <div class="product-header-row">
              <h3 class="product-title">${product.name}</h3>
            </div>
            <div class="product-tagline">${product.tagline}</div>
            <p class="product-desc">${product.description}</p>
            
            <div class="product-dietary-tags">
              ${dietaryTagsHtml}
            </div>

            <div class="product-footer-row">
              <div class="product-price-box">
                <span class="price-prefix">From</span>
                <div class="price-value"><span>AED</span>${defaultSize.price}</div>
              </div>
              <button class="btn btn-primary btn-sm view-details-btn" data-product-id="${product.id}">
                Order & Customize
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Handle Opening Product Modal
  container.addEventListener('click', (e) => {
    const trigger = e.target.closest('.view-details-btn') || e.target.closest('.product-card');
    if (!trigger) return;
    const productId = trigger.dataset.productId || trigger.closest('.product-card')?.dataset.productId;
    if (productId) {
      openProductModal(productId);
    }
  });

  function openProductModal(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    activeProduct = product;
    selectedSize = product.sizes.find(s => s.default) || product.sizes[0];
    selectedFlavor = product.flavorProfiles[0]?.name || '';
    plaqueText = '';
    candleCount = 0;
    orderQty = 1;

    renderModalContent();
    modal.showModal();
  }

  function renderModalContent() {
    if (!activeProduct) return;

    const modalBody = modal.querySelector('.dialog-content');
    if (!modalBody) return;

    const currentPrice = selectedSize.price * orderQty;

    modalBody.innerHTML = `
      <div class="dialog-image-col">
        <img src="${activeProduct.image}" alt="${activeProduct.name}" class="dialog-image" />
        <button class="dialog-close-btn" id="close-product-dialog" aria-label="Close modal">✕</button>
      </div>

      <div class="dialog-body-col">
        <div style="margin-bottom: 0.5rem;">
          <span class="badge badge-gold" style="margin-bottom: 0.5rem;">${activeProduct.badge}</span>
          <h2 style="font-size: 1.85rem; margin-bottom: 0.25rem;">${activeProduct.name}</h2>
          <div style="font-size: 0.9rem; color: var(--color-gold-600); font-weight: 600;">${activeProduct.tagline}</div>
        </div>

        <p style="font-size: 0.92rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
          ${activeProduct.description}
        </p>

        <!-- Size Selection -->
        <div style="margin-bottom: 1.25rem;">
          <div class="options-group-title">1. Select Cake Size & Servings</div>
          <div class="size-selector-grid">
            ${activeProduct.sizes.map(size => `
              <div class="size-option-card ${size.id === selectedSize.id ? 'selected' : ''}" data-size-id="${size.id}">
                <div class="size-option-label">${size.label}</div>
                <div class="size-option-price">AED ${size.price}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Flavor Profile -->
        <div style="margin-bottom: 1.25rem;">
          <div class="options-group-title">2. Choose Flavor Profile</div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${activeProduct.flavorProfiles.map((f, i) => `
              <label style="display: flex; align-items: center; gap: 0.65rem; font-size: 0.88rem; cursor: pointer;">
                <input type="radio" name="modal-flavor" value="${f.name}" ${f.name === selectedFlavor ? 'checked' : ''} />
                <span>${f.name}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Custom Plaque Message -->
        <div style="margin-bottom: 1.25rem;">
          <label class="form-label" for="plaque-input">
            <span>3. Complimentary Chocolate Plaque Inscription</span>
            <span class="form-label-hint">Max 35 chars</span>
          </label>
          <input 
            type="text" 
            id="plaque-input" 
            class="form-input" 
            placeholder="e.g. Happy Birthday Layla ✨" 
            maxlength="35"
            value="${plaqueText}"
          />
          <div class="plaque-preview-box" id="plaque-preview">
            "${plaqueText || 'Your Custom Plaque Inscription'}"
          </div>
        </div>

        <!-- Complimentary Candles -->
        <div style="margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
          <label style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-title);" for="candle-select">
            Complimentary Gold Candles:
          </label>
          <select id="candle-select" class="form-select" style="width: 140px; padding: 0.4rem 0.75rem;">
            <option value="0" ${candleCount === 0 ? 'selected' : ''}>No Candles</option>
            <option value="1" ${candleCount === 1 ? 'selected' : ''}>1 Candle</option>
            <option value="2" ${candleCount === 2 ? 'selected' : ''}>2 Candles</option>
            <option value="3" ${candleCount === 3 ? 'selected' : ''}>3 Candles</option>
            <option value="5" ${candleCount === 5 ? 'selected' : ''}>5 Candles</option>
          </select>
        </div>

        <!-- Notice & Add To Cart Button -->
        <div style="background: var(--color-berry-50); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--color-berry-800); margin-bottom: 1.5rem; border-left: 3px solid var(--color-gold-500);">
          🕒 <strong>Dubai Fresh Baking Notice:</strong> Handcrafted to order with 24h temperature-controlled delivery.
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(70, 20, 47, 0.1);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="cart-qty-control" style="padding: 4px 8px;">
              <button class="qty-btn" id="modal-qty-minus">-</button>
              <span class="qty-num" id="modal-qty-display">${orderQty}</span>
              <button class="qty-btn" id="modal-qty-plus">+</button>
            </div>
            <div style="font-size: 1.35rem; font-family: var(--font-serif); font-weight: 700; color: var(--color-berry-900); margin-left: 0.5rem;">
              AED <span id="modal-total-price">${currentPrice}</span>
            </div>
          </div>

          <button class="btn btn-gold btn-lg" id="modal-add-to-cart-btn" style="flex-grow: 1; max-width: 240px;">
            Add to Bag ✦
          </button>
        </div>
      </div>
    `;

    bindModalEvents();
  }

  function bindModalEvents() {
    const closeBtn = modal.querySelector('#close-product-dialog');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.close());
    }

    // Size cards
    modal.querySelectorAll('.size-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const sizeId = card.dataset.sizeId;
        selectedSize = activeProduct.sizes.find(s => s.id === sizeId);
        modal.querySelectorAll('.size-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        updateModalPrice();
      });
    });

    // Flavors
    modal.querySelectorAll('input[name="modal-flavor"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedFlavor = e.target.value;
      });
    });

    // Plaque input
    const plaqueInput = modal.querySelector('#plaque-input');
    const plaquePreview = modal.querySelector('#plaque-preview');
    if (plaqueInput && plaquePreview) {
      plaqueInput.addEventListener('input', (e) => {
        plaqueText = e.target.value;
        plaquePreview.textContent = plaqueText ? `"${plaqueText}"` : '"Your Custom Plaque Inscription"';
      });
    }

    // Candle select
    const candleSelect = modal.querySelector('#candle-select');
    if (candleSelect) {
      candleSelect.addEventListener('change', (e) => {
        candleCount = parseInt(e.target.value, 10);
      });
    }

    // Quantity controls
    const qtyMinus = modal.querySelector('#modal-qty-minus');
    const qtyPlus = modal.querySelector('#modal-qty-plus');
    const qtyDisplay = modal.querySelector('#modal-qty-display');

    if (qtyMinus && qtyPlus && qtyDisplay) {
      qtyMinus.addEventListener('click', () => {
        if (orderQty > 1) {
          orderQty--;
          qtyDisplay.textContent = orderQty;
          updateModalPrice();
        }
      });
      qtyPlus.addEventListener('click', () => {
        orderQty++;
        qtyDisplay.textContent = orderQty;
        updateModalPrice();
      });
    }

    // Add to Cart
    const addBtn = modal.querySelector('#modal-add-to-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        cartManager.addItem(activeProduct, {
          size: selectedSize,
          flavor: selectedFlavor,
          plaque: plaqueText,
          candles: candleCount,
          quantity: orderQty
        });

        toast.show(`Added <strong>${activeProduct.name}</strong> to your bag!`, 'success');
        modal.close();

        // Open cart drawer for quick feedback
        const cartOverlay = document.getElementById('cart-drawer-overlay');
        if (cartOverlay) {
          cartOverlay.classList.add('open');
        }
      });
    }
  }

  function updateModalPrice() {
    const priceDisplay = modal.querySelector('#modal-total-price');
    if (priceDisplay && selectedSize) {
      priceDisplay.textContent = selectedSize.price * orderQty;
    }
  }

  // Light dismiss on backdrop click
  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      modal.close();
    }
  });

  // Initial render
  renderProducts();
}
