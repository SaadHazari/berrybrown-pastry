import { CONTACT } from '../../data/content';
import { ButtonLink } from '../ui/Button';

/** Gift buyers can also find us on Udora. "Coming soon" until CONTACT.udora has the shop link. */
export function Udora() {
  return (
    <section id="udora" className="section-default" aria-label="Udora">
      <div className="container-x">
        <div className="flex flex-col items-start gap-md border-y border-cocoa-15 py-lg md:flex-row md:items-center md:gap-lg">
          <img src="/brand/berrybrown-circle-rose.svg" alt="" width={200} height={200} className="size-[48px] shrink-0" />
          <p className="t-body flex-1">Sending a cake as a gift? Our bento cakes and 5-inch cakes are also on Udora.</p>
          {CONTACT.udora ? (
            <ButtonLink variant="ghost" href={CONTACT.udora} target="_blank" rel="noopener noreferrer">
              Shop on Udora
            </ButtonLink>
          ) : (
            <span className="t-label text-cocoa-70">Coming soon to Udora</span>
          )}
        </div>
      </div>
    </section>
  );
}
