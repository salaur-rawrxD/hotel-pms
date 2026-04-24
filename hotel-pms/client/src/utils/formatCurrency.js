export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const formatCurrencyShort = (amount) => {
  const n = Number(amount) || 0;
  if (Math.abs(n) >= 1000) {
    return "$" + (n / 1000).toFixed(1) + "k";
  }
  return formatCurrency(n);
};
