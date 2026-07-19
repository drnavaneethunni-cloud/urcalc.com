const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $1,234 — whole-dollar display for large figures */
export function fmtC(cents: number): string {
  return usd.format(Math.round(cents / 100));
}

/** $1,234.56 — exact display for monthly payments */
export function fmtCents(cents: number): string {
  return usdCents.format(cents / 100);
}

export function fmtPct(v: number, digits = 2): string {
  return `${v.toFixed(digits)}%`;
}

export function fmtMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr`;
  return `${y} yr ${m} mo`;
}
