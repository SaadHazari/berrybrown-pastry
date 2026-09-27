import { EVENTS } from '../../data/companies';
import { CONTACT } from '../../data/content';
import { mailtoLink } from '../../lib/order';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Heading } from '../ui/Heading';
import { Photo } from '../ui/Photo';
import { Rise } from '../ui/Rise';

export function CompanyEvents() {
  const { open } = useUI();
  return (
    <section id="events" className="section-more bg-rose" aria-labelledby="events-title">
      <div className="container-x">
        <Heading id="events-title" tone="rose" label="For companies · 3 of 3" title="Team events and dessert tables." oneliner="In your office, on your date. Invoiced." />
        <ul className="mt-xl grid gap-lg md:grid-cols-2">
          {EVENTS.formats.map((f, i) => (
            <Rise as="li" key={f.id} delay={i * 0.1}>
              <article className="flex h-full flex-col overflow-hidden rounded border border-cocoa-15 bg-butter">
                <Photo media={f.image} ratio="3 / 2" zoom className="rounded-none!" sizes="(min-width: 768px) 45vw, 92vw" />
                <div className="flex flex-1 flex-col p-lg">
                  <h3 className="t-title3">{f.title}</h3>
                  <p className="t-body mt-sm text-cocoa-70">{f.text}</p>
                  <p className="t-price mt-auto pt-md">{f.price}</p>
                </div>
              </article>
            </Rise>
          ))}
        </ul>
        <p className="t-label mt-lg text-cocoa">{EVENTS.facts.join(' · ')}</p>
        <div className="mt-xl flex flex-wrap items-center gap-md">
          <Button variant="claret" onClick={() => open({ kind: 'quote', about: 'event' })}>
            Get a quote
          </Button>
          <a href={mailtoLink('Company event quote')} className="t-body link">
            or email {CONTACT.email}
          </a>
        </div>
      </div>
    </section>
  );
}
