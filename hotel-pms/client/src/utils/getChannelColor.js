import { BOOKING_SOURCES } from "../constants/bookingSources.js";

const CHANNEL_COLORS = {
  [BOOKING_SOURCES.DIRECT]:    "bg-teal-500/15 text-teal-200 border-teal-500/40",
  [BOOKING_SOURCES.EXPEDIA]:   "bg-yellow-500/15 text-yellow-200 border-yellow-500/40",
  [BOOKING_SOURCES.BOOKING]:   "bg-blue-500/15 text-blue-200 border-blue-500/40",
  [BOOKING_SOURCES.AIRBNB]:    "bg-rose-500/15 text-rose-200 border-rose-500/40",
  [BOOKING_SOURCES.CORPORATE]: "bg-violet-500/15 text-violet-200 border-violet-500/40",
  [BOOKING_SOURCES.WALKIN]:    "bg-slate-500/15 text-slate-200 border-slate-500/40",
};

export function getChannelColor(source) {
  return CHANNEL_COLORS[source] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";
}
