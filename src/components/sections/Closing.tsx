import { useUI } from '../../store/ui';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';

/** Text on Butter. Nothing else in the frame. */
export function Closing() {
  const { open } = useUI();
  return (
    <section className="section-most" aria-labelledby="closing-title">
      <Reveal className="container-x flex flex-col items-center text-center">
        <h2 id="closing-title" className="t-title2">
          Let's bake something lovely.
        </h2>
        <Button variant="claret" className="mt-xl" onClick={() => open({ kind: 'menu' })}>
          Order
        </Button>
      </Reveal>
    </section>
  );
}
