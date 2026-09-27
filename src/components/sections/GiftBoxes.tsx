import { BOX, deadlineLine, upcomingDeadlines } from '../../data/companies';
import { CONTACT } from '../../data/content';
import { media } from '../../data/media';
import { mailtoLink } from '../../lib/order';
import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Frame } from '../ui/Frame';
import { Heading } from '../ui/Heading';
import { Parallax } from '../ui/Parallax';
import { Photo } from '../ui/Photo';

/** The Box, on Cocoa. No Claret here: never Claret on Cocoa. */
export function GiftBoxes() {
  const { open } = useUI();
  const deadlines = upcomingDeadlines();
  return (
    <section id="gift-boxes" className="section-more relative overflow-clip bg-cocoa text-butter" aria-labelledby="box-title">
      <span id="companies" className="absolute top-0" aria-hidden />
      <div className="container-x grid items-center gap-2xl lg:grid-cols-12">
        <div className="relative pb-xl lg:col-span-5 lg:pb-0">
          <Parallax offset={24}>
            <Photo media={media.box.open} sizes="(min-width: 1024px) 480px, 90vw" />
          </Parallax>
          <Parallax offset={70} rotate={3} className="absolute -bottom-md -right-sm w-[46%] max-w-[240px] lg:-right-xl">
            <Frame>
              <Photo media={media.box.stack} sizes="240px" />
            </Frame>
          </Parallax>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Heading id="box-title" tone="cocoa" label="For companies · 1 of 3" title="The Box." oneliner="Gift boxes for your team and your clients." />
          <p className="t-body mt-lg max-w-[52ch]">Brownies and cookies, packed by hand in our box with a sleeve and a hand-written card. Add your logo to the sleeve from 50 boxes.</p>
          <ul className="mt-lg border-t border-butter/15">
            {BOX.sizes.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between border-b border-butter/15 py-sm">
                <span className="t-label">{s.pieces} pieces</span>
                <span className="t-price">AED {s.price}</span>
              </li>
            ))}
          </ul>
          <p className="t-label mt-md text-butter-60">{BOX.facts.join(' · ')}</p>
          {deadlines.length > 0 && (
            <div className="mt-lg">
              <p className="t-label text-butter-60">Order by</p>
              <ul className="mt-xs space-y-2xs">
                {deadlines.map((d) => (
                  <li key={d.label} className="t-callout">
                    {deadlineLine(d)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-xl flex flex-wrap items-center gap-md">
            <Button variant="butter" onClick={() => open({ kind: 'quote', about: 'box' })}>
              Get a quote
            </Button>
            <a href={mailtoLink('Gift boxes quote')} className="t-body link text-butter">
              or email {CONTACT.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
