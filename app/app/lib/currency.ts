export function getPrettyCurrency(
  amount: number,
  currency: 'USD' | 'BZD'
): string {
  return new Intl.NumberFormat('en-BZ', { style: 'currency', currency }).format(
    amount
  );
}

export function getPrettyNumber(amount: number): string {
  const formatter = new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  });

  return formatter.format(amount);
}
