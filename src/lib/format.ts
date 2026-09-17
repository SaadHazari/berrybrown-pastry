const nf = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 0 });

export const aed = (n: number) => `AED ${nf.format(n)}`;

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
