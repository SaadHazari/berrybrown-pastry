import { useEffect, useState } from 'react';
import { CONTACT, OFFERS, isOfferId, shortDate, upcomingDeadlines, type OfferId } from '../../data/content';
import { cn } from '../../lib/cn';
import { recordEnquiry } from '../../lib/api';
import { enquiryMessage, whatsappLink } from '../../lib/order';
import { ButtonLink } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export function Companies() {
  const [about, setAbout] = useState<OfferId | null>(null);
  const deadlines = upcomingDeadlines();

  // Instagram links can pre-fill the product: berrybrown.me/?about=box#companies
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('about');
    if (isOfferId(v)) setAbout(v);
  }, []);

  const selected = about ? OFFERS.find((o) => o.id === about) : undefined;

  return (
    <section id="companies" className="section-more bg-rose" aria-labelledby="companies-title">
      <Reveal className="container-x">
        <SectionHeading id="companies-title" title="For companies and events" oneliner="Gift boxes, workshops and dessert tables. Invoiced, delivered, on time." onRose />

        <ul className="mt-xl grid gap-md md:grid-cols-3" role="list">
          {OFFERS.map((o) => {
            const on = about === o.id;
            return (
              <li key={o.id}>
                <article className={cn('flex h-full flex-col rounded border bg-butter p-lg transition-colors', on ? 'border-cocoa' : 'border-cocoa-15')}>
                  <img src={o.icon} alt="" width={200} height={200} className="size-[44px]" />
                  <h3 className="t-heading mt-md">
                    <button type="button" onClick={() => setAbout(o.id)} aria-pressed={on} className="link text-left">
                      {o.title}
                    </button>
                  </h3>
                  <p className="t-callout mt-sm text-cocoa-70">{o.text}</p>
                  <p className="t-price mt-auto pt-md">{o.price}</p>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="mt-xl flex flex-wrap items-center gap-md md:gap-lg">
          <ButtonLink
            variant="claret"
            href={whatsappLink(enquiryMessage(about))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordEnquiry({ kind: 'company', about, message: enquiryMessage(about) })}
          >
            Enquire on WhatsApp
          </ButtonLink>
          <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(selected ? `${selected.title} enquiry` : 'Company enquiry')}`} className="t-body link">
            or email {CONTACT.email}
          </a>
        </div>
        <p className="t-caption mt-sm text-cocoa" aria-live="polite">
          {selected ? `Asking about ${selected.title}. Tap another title to change.` : 'Tap a title to say which one you mean.'}
        </p>

        {deadlines.length > 0 && <p className="t-label mt-lg text-cocoa">{deadlines.map((d) => `${d.label} ${shortDate(d.date)}`).join(' · ')}.</p>}
      </Reveal>
    </section>
  );
}
