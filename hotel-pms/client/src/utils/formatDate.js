import { format, formatDistanceToNow, parseISO } from "date-fns";

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") return parseISO(value);
  return new Date(value);
}

export function formatDate(value, pattern = "MMM d, yyyy") {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "—";
  return format(date, pattern);
}

export function formatDateTime(value, pattern = "MMM d, yyyy h:mm a") {
  return formatDate(value, pattern);
}

export function formatRelative(value) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}
