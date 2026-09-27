import { cakeNumber } from '../../data/content';
import { useLog } from '../../lib/live';
import { Photo } from '../ui/Photo';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export function TheLog() {
  const log = useLog();
  return (
    <section id="log" className="section-more" aria-labelledby="log-title">
      <Reveal className="container-x">
        <SectionHeading id="log-title" title="The log" oneliner="Every cake gets a number." />
        <ul className="no-scrollbar -mx-md mt-xl flex snap-x snap-mandatory gap-md overflow-x-auto px-md md:mx-0 md:grid md:grid-cols-3 md:gap-lg md:overflow-visible md:px-0" role="list">
          {log.slice(0, 3).map((l) => (
            <li key={l.n} className="w-[80%] shrink-0 snap-start md:w-auto">
              <figure>
                <Photo media={l.image} />
                <figcaption className="mt-sm flex items-baseline gap-sm">
                  <span className="t-price text-claret">{cakeNumber(l.n)}</span>
                  <span className="t-caption text-cocoa-70">
                    {l.for} · {l.flavour}, {l.size}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
