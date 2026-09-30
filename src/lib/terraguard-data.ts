export type Action = "ALLOW" | "REVIEW" | "BLOCK";

export type Txn = {
  id: string;
  merchant: string;
  city: string;
  amount: number;
  risk: number; // 0-1
  latency_ms: number;
  action: Action;
};

const MERCHANTS = [
  "Amazon",
  "Uber",
  "CryptoExchange",
  "WireTransferCo",
  "Netflix",
  "Swiggy",
  "Apple Store",
  "Emirates Air",
  "GiftCardHub",
  "Steam",
  "IKEA",
  "Shell Fuel",
  "OffshorePay",
  "Zara",
  "Booking.com",
];

const CITIES = [
  "Mumbai",
  "Dubai",
  "Singapore",
  "London",
  "New York",
  "Lagos",
  "Frankfurt",
  "Tokyo",
  "São Paulo",
  "Sydney",
];

const HIGH_RISK_MERCHANTS = new Set([
  "CryptoExchange",
  "WireTransferCo",
  "GiftCardHub",
  "OffshorePay",
]);

export function actionFor(risk: number): Action {
  if (risk > 0.75) return "BLOCK";
  if (risk >= 0.5) return "REVIEW";
  return "ALLOW";
}

// Deterministic PRNG so server and client render the same seeded dataset.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTxn(rand: () => number, index: number): Txn {
  const merchant = MERCHANTS[Math.floor(rand() * MERCHANTS.length)];
  const city = CITIES[Math.floor(rand() * CITIES.length)];
  const hot = HIGH_RISK_MERCHANTS.has(merchant);

  const roll = rand();
  let risk: number;
  if (roll > 0.98 || (hot && roll > 0.9)) {
    risk = 0.76 + rand() * 0.23; // BLOCK
  } else if (roll > 0.93 || (hot && roll > 0.75)) {
    risk = 0.5 + rand() * 0.25; // REVIEW
  } else {
    risk = rand() * (rand() > 0.85 ? 0.49 : 0.3);
  }

  const outlier = rand() > 0.94;
  const base = 5 + rand() * (outlier ? 8995 : 900);
  const amount = Math.round((risk > 0.75 ? base * 1.8 : base) * 100) / 100;

  return {
    id: `TXN-${920000 + index}`,
    merchant,
    city,
    amount: Math.min(amount, 9000),
    risk: Math.round(risk * 1000) / 1000,
    latency_ms: Math.round((1.5 + rand() * 10.5) * 10) / 10,
    action: actionFor(risk),
  };
}

/** 400 embedded transactions — zero backend required. */
export const TRANSACTIONS: Txn[] = (() => {
  const rand = mulberry32(20261001);
  return Array.from({ length: 400 }, (_, i) => makeTxn(rand, i));
})();

/** Endless stream over the embedded dataset, re-labelled with fresh ids. */
export function txnAt(cursor: number): Txn {
  const base = TRANSACTIONS[cursor % TRANSACTIONS.length];
  return { ...base, id: `TXN-${920000 + cursor}` };
}

export const ACTION_STYLES: Record<Action, string> = {
  ALLOW: "bg-success/15 text-success border-success/30",
  REVIEW: "bg-warning/15 text-warning border-warning/30",
  BLOCK: "bg-danger/15 text-danger border-danger/30",
};

export const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
