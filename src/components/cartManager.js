import { DUBAI_ZONES, CONTACT_CONFIG } from '../data/dubaiZones.js';

class CartManager {
  constructor() {
    this.storageKey = 'berrybrown_cart_v1';
    this.zoneStorageKey = 'berrybrown_zone_v1';
    this.listeners = [];
    this.items = this.loadCart();
    this.selectedZoneId = localStorage.getItem(this.zoneStorageKey) || 'downtown-difc';
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      localStorage.setItem(this.zoneStorageKey, this.selectedZoneId);
    } catch (e) {
      console.error('Error saving cart:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.getState());
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  getState() {
    const subtotal = this.getSubtotal();
    const zone = this.getSelectedZone();
    const isDeliveryFree = subtotal >= zone.freeThreshold && zone.fee > 0;
    const deliveryFee = isDeliveryFree ? 0 : zone.fee;
    const total = subtotal + deliveryFee;
    const count = this.getItemCount();

    return {
      items: this.items,
      count,
      subtotal,
      zone,
      isDeliveryFree,
      deliveryFee,
      total,
      currency: CONTACT_CONFIG.currency
    };
  }

  getItemCount() {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getSelectedZone() {
    const found = DUBAI_ZONES.find(z => z.id === this.selectedZoneId);
    return found || DUBAI_ZONES[0];
  }

  setSelectedZone(zoneId) {
    this.selectedZoneId = zoneId;
    this.saveCart();
  }

  addItem(product, config = {}) {
    const {
      size = product.sizes[0],
      flavor = product.flavorProfiles[0]?.name || 'Signature',
      plaque = '',
      candles = 0,
      quantity = 1
    } = config;

    const key = `${product.id}_${size.id}_${flavor}_${plaque.trim().toLowerCase()}`;

    const existingIndex = this.items.findIndex(item => item.key === key);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        key,
        productId: product.id,
        name: product.name,
        image: product.image,
        sizeId: size.id,
        sizeLabel: size.label,
        flavor,
        plaque: plaque.trim(),
        candles,
        price: size.price,
        quantity
      });
    }

    this.saveCart();
  }

  updateQuantity(key, delta) {
    const index = this.items.findIndex(item => item.key === key);
    if (index > -1) {
      this.items[index].quantity += delta;
      if (this.items[index].quantity <= 0) {
        this.items.splice(index, 1);
      }
      this.saveCart();
    }
  }

  removeItem(key) {
    this.items = this.items.filter(item => item.key !== key);
    this.saveCart();
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  formatPrice(amount) {
    return `${CONTACT_CONFIG.currency} ${amount.toLocaleString()}`;
  }

  getWhatsAppOrderMessage(orderData = {}) {
    const { orderRef, customer, delivery } = orderData;
    const state = this.getState();

    let msg = `*NEW ORDER - BERRYBROWN ATELIER DUBAI*\n`;
    if (orderRef) msg += `Order Reference: *${orderRef}*\n`;
    msg += `--------------------------------\n`;

    if (customer) {
      msg += `*Client:* ${customer.name}\n`;
      msg += `*Contact:* ${customer.phone}\n`;
      if (customer.email) msg += `*Email:* ${customer.email}\n`;
      msg += `\n*Delivery Details:*\n`;
      msg += `Area: ${delivery.zoneName}\n`;
      msg += `Date: ${delivery.date} (${delivery.timeSlot})\n`;
      if (delivery.address) msg += `Address: ${delivery.address}\n`;
      if (delivery.instructions) msg += `Notes: ${delivery.instructions}\n`;
      if (delivery.giftMessage) msg += `Gift Card Message: "${delivery.giftMessage}"\n`;
    }

    msg += `\n*Itemized Order:*\n`;
    this.items.forEach((item, i) => {
      msg += `${i + 1}. *${item.name}* (Qty: ${item.quantity})\n`;
      msg += `   • Size: ${item.sizeLabel}\n`;
      msg += `   • Flavor: ${item.flavor}\n`;
      if (item.plaque) msg += `   • Plaque Inscription: "${item.plaque}"\n`;
      msg += `   • Subtotal: ${this.formatPrice(item.price * item.quantity)}\n`;
    });

    msg += `--------------------------------\n`;
    msg += `*Subtotal:* ${this.formatPrice(state.subtotal)}\n`;
    msg += `*Delivery Fee:* ${state.deliveryFee === 0 ? 'FREE' : this.formatPrice(state.deliveryFee)}\n`;
    msg += `*Total:* *${this.formatPrice(state.total)}*\n`;
    msg += `\nPlease confirm preparation and delivery slot with Chef Safa. Thank you!`;

    return encodeURIComponent(msg);
  }
}

export const cartManager = new CartManager();
