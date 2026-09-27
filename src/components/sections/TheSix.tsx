import { PRODUCTS, WRITTEN_ON } from '../../data/products';
import { ProductCard } from '../shop/ProductCard';
import { Reveal } from '../ui/Reveal';
import { SectionHeading } from '../ui/SectionHeading';

export function TheSix() {
  return (
    <section id="the-six" className="section-more" aria-labelledby="six-title">
      <Reveal className="container-x">
        <SectionHeading id="six-title" title="The Six" oneliner="Six signature cakes. Three sizes. Made to order." />
        <ul className="mt-xl grid grid-cols-2 gap-sm md:gap-lg lg:grid-cols-3" role="list">
          {PRODUCTS.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
        <p className="t-label mt-xl text-cocoa-70">Written on — any of the Six with a hand-piped message and one decoration, +{WRITTEN_ON.price}.</p>
      </Reveal>
    </section>
  );
}
