export function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(n ?? 0));
}

const TIER = {
  PLATINUM: "bg-purple-600/20 text-purple-200 ring-1 ring-purple-500/40",
  GOLD: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/40",
  SILVER: "bg-slate-500/20 text-slate-200 ring-1 ring-slate-500/30",
  BRONZE: "bg-amber-800/20 text-amber-100 ring-1 ring-amber-700/30",
  NONE: "",
};

export function loyaltyClass(tier) {
  return TIER[tier] || TIER.NONE;
}

export function sourceLabel(src) {
  const m = {
    DIRECT: "Direct",
    EXPEDIA: "Expedia",
    BOOKING: "Booking.com",
    AIRBNB: "Airbnb",
    CORPORATE: "Corporate",
    WALKIN: "Walk-in",
  };
  return m[src] || src;
}
