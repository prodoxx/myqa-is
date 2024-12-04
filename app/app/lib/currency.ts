export function getPrettyCurrency(amount: number, currency: 'USD' | 'BZD'): string {
  return new Intl.NumberFormat('en-BZ', { style: 'currency', currency }).format(amount);
}
