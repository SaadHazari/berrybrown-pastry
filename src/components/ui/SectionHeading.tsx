type Props = { title: string; oneliner?: string; id?: string; className?: string; /** On a Rose panel the one-liner needs full Cocoa for contrast. */ onRose?: boolean };

/** Section title (title3) and its one-liner (Alegreya Medium Italic). Left-aligned, always. */
export function SectionHeading({ title, oneliner, id, className, onRose = false }: Props) {
  return (
    <div className={className}>
      <h2 id={id} className="t-title3">
        {title}
      </h2>
      {oneliner && <p className={onRose ? 't-oneliner mt-xs text-cocoa' : 't-oneliner mt-xs text-cocoa-70'}>{oneliner}</p>}
    </div>
  );
}
