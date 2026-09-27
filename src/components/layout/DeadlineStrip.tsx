import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { nextDeadline } from '../../data/companies';
import { shortDate } from '../../lib/dates';
import { readFlag, writeFlag } from '../../lib/storage';

const KEY = 'bb-strip-closed';

/** The next gift-box order-by date, above the top bar. Scrolls away with the page; closes for the session. */
export function DeadlineStrip() {
  const next = useMemo(() => nextDeadline(), []);
  const [closed, setClosed] = useState(() => readFlag(KEY));
  if (!next || closed) return null;
  return (
    <div className="bg-cocoa text-butter">
      <div className="container-x flex min-h-[44px] items-center gap-md">
        <a href="#gift-boxes" className="t-label min-w-0 flex-1 truncate">
          {next.label} gift boxes · order by {shortDate(next.date)}
        </a>
        <a href="#gift-boxes" className="t-label link hidden shrink-0 sm:inline">
          Get a quote →
        </a>
        <button
          type="button"
          onClick={() => {
            setClosed(true);
            writeFlag(KEY);
          }}
          className="-mr-sm grid size-[44px] shrink-0 place-items-center rounded transition-colors hover:bg-butter/10"
          aria-label="Hide this message"
        >
          <X className="size-[14px]" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
