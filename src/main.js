import './style.css';
import { initNavigation } from './components/navigation.js';
import { initCatalog } from './components/catalogRenderer.js';
import { initCakeCustomizer } from './components/cakeCustomizer.js';
import { initCheckout } from './components/checkoutModal.js';
import { TESTIMONIALS, FAQS } from './data/testimonials.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Components
  initNavigation();
  initCatalog();
  initCakeCustomizer();
  initCheckout();

  // Render Testimonials
  const testimonialsContainer = document.getElementById('testimonials-grid');
  if (testimonialsContainer) {
    testimonialsContainer.innerHTML = TESTIMONIALS.map(item => `
      <div class="testimonial-card">
        <div>
          <div class="testimonial-stars">★★★★★</div>
          <div class="testimonial-quote">"${item.quote}"</div>
        </div>
        <div class="testimonial-author">
          <div class="author-name">${item.client}</div>
          <div class="author-location">${item.location} • <span style="color: var(--color-berry-700); font-weight: 500;">${item.event}</span></div>
        </div>
      </div>
    `).join('');
  }

  // Render FAQs & Accordion
  const faqContainer = document.getElementById('faq-list');
  if (faqContainer) {
    faqContainer.innerHTML = FAQS.map((faq, index) => `
      <div class="faq-item ${index === 0 ? 'open' : ''}">
        <button class="faq-question" type="button">
          <span>${faq.question}</span>
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          <p>${faq.answer}</p>
        </div>
      </div>
    `).join('');

    faqContainer.addEventListener('click', (e) => {
      const questionBtn = e.target.closest('.faq-question');
      if (!questionBtn) return;
      const faqItem = questionBtn.closest('.faq-item');
      if (faqItem) {
        faqItem.classList.toggle('open');
      }
    });
  }

  // Hero Quick Order Button to scroll to catalog
  const heroExploreBtn = document.getElementById('hero-explore-btn');
  if (heroExploreBtn) {
    heroExploreBtn.addEventListener('click', () => {
      document.getElementById('creations')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const heroBespokeBtn = document.getElementById('hero-bespoke-btn');
  if (heroBespokeBtn) {
    heroBespokeBtn.addEventListener('click', () => {
      document.getElementById('bespoke-customizer')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
