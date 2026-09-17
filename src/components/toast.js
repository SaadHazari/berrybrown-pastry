class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  show(message, type = 'gold', duration = 3600) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? '✓' : '✦';
    toast.innerHTML = `
      <span style="color: var(--color-gold-400); font-weight: bold; font-size: 1.1rem;">${icon}</span>
      <div>${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 260);
    }, duration);
  }
}

export const toast = new ToastManager();
