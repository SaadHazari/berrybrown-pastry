import { WORKSHOP } from '../../data/companies';
import { media } from '../../data/media';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

export function Workshops() {
  const { open } = useUI();
  return (
    <section id="workshops" className="section-more overflow-clip" aria-labelledby="workshops-title">
      <div className="container-x grid items-center gap-2xl lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Heading id="workshops-title" label="For groups · 2 of 3" title="Make one with us." oneliner="A 90-minute cake decorating workshop for your group." />
          <p className="t-body mt-lg max-w-[52ch]">We bring the cakes, the tools and the know-how. Everyone decorates their own cake and takes it home. For clubs, community groups, co-working spaces and parties.</p>
          <ul className="mt-lg border-t border-cocoa-15">
            {WORKSHOP.places.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-md border-b border-cocoa-15 py-sm">
                <span className="t-label">{p.label}</span>
                <span className="t-price">From AED {p.from} a seat</span>
              </li>
            ))}
          </ul>
          <p className="t-label mt-md text-cocoa-70">{WORKSHOP.facts.join(' · ')}</p>
          <Button variant="claret" className="mt-xl" onClick={() => open({ kind: 'quote', about: 'workshop' })}>
            Get a quote
          </Button>
        </div>
        <div className="relative pb-xl lg:col-span-5 lg:col-start-8 lg:pb-0">
          <Parallax offset={24} rotate={2}>
            <Frame>
              <Photo media={media.workshop.table} sizes="(min-width: 1024px) 440px, 90vw" />
            </Frame>
          </Parallax>
          <Parallax offset={70} rotate={-4} className="absolute -bottom-md -left-sm w-[44%] max-w-[220px]">
            <Frame>
              <Photo media={media.workshop.piping} sizes="220px" />
            </Frame>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
