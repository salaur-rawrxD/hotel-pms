import { format, formatDistanceToNow, parseISO } from "date-fns";

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = parseISO(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export const formatDate = (date) => {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "MMM d, yyyy");
};

export const formatDateShort = (date) => {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "MMM d");
};

export const formatTime = (date) => {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, "h:mm a");
};

// TopBar still imports formatDateTime, so keep it available for back-compat.
export const formatDateTime = (date, pattern = "MMM d, yyyy h:mm a") => {
  const d = toDate(date);
  if (!d) return "—";
  return format(d, pattern);
};

export const formatRelative = (date) => {
  const d = toDate(date);
  if (!d) return "—";
  return formatDistanceToNow(d, { addSuffix: true });
};
