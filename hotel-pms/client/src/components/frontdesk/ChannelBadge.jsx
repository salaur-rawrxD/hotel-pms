import clsx from "clsx";

import { sourceLabel } from "./utils.js";

const COLORS = {
  DIRECT: "bg-teal/15 text-teal-light ring-teal/30",
  EXPEDIA: "bg-blue-500/15 text-blue-200 ring-blue-500/30",
  BOOKING: "bg-indigo-500/15 text-indigo-200 ring-indigo-500/30",
  AIRBNB: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
  CORPORATE: "bg-slate-500/15 text-slate-200 ring-slate-500/30",
  WALKIN: "bg-gold/15 text-gold ring-gold/40",
};

export default function ChannelBadge({ source, className }) {
  if (!source) return null;
  return (
    <span
      className={clsx(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        COLORS[source] || "bg-navy-700 text-slate-300 ring-navy-600",
        className,
      )}
    >
      {sourceLabel(source)}
    </span>
  );
}
