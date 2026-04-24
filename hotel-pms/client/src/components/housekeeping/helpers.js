// Shared display helpers for the Housekeeping module.

export function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export const TASK_STATUS_META = {
  PENDING:     { label: "Pending",      icon: "⏳", bg: "bg-slate-100",  text: "text-slate-700",  dot: "#94a3b8" },
  IN_PROGRESS: { label: "In Progress",  icon: "🔄", bg: "bg-amber-50",   text: "text-amber-700",  dot: "#f59e0b" },
  INSPECTED:   { label: "Ready",        icon: "👁",  bg: "bg-blue-50",    text: "text-blue-700",   dot: "#3b82f6" },
  DONE:        { label: "Done",         icon: "✅", bg: "bg-emerald-50", text: "text-emerald-700",dot: "#10b981" },
};

export const TASK_TYPE_META = {
  CHECKOUT:   { label: "Checkout",    bg: "bg-orange-100",  text: "text-orange-700" },
  STAY_OVER:  { label: "Stay-Over",   bg: "bg-blue-100",    text: "text-blue-700" },
  DEEP_CLEAN: { label: "Deep Clean",  bg: "bg-purple-100",  text: "text-purple-700" },
};

export const SEVERITY_META = {
  LOW:    { label: "Low",    bg: "bg-slate-200",   text: "text-slate-700" },
  MEDIUM: { label: "Medium", bg: "bg-amber-200",   text: "text-amber-900" },
  HIGH:   { label: "High",   bg: "bg-rose-500",    text: "text-white" },
};

export const URGENCY_META = {
  NORMAL: { label: "Normal", bg: "bg-slate-200", text: "text-slate-700" },
  URGENT: { label: "Urgent", bg: "bg-rose-500",  text: "text-white" },
};

export const LF_STATUS_META = {
  UNCLAIMED: { label: "Unclaimed", bg: "bg-amber-100",   text: "text-amber-800" },
  CLAIMED:   { label: "Claimed",   bg: "bg-emerald-100", text: "text-emerald-800" },
  RETURNED:  { label: "Returned",  bg: "bg-teal-100",    text: "text-teal-800" },
  DONATED:   { label: "Donated",   bg: "bg-slate-200",   text: "text-slate-700" },
};

// Operational floor-map colors — "In Progress" (task) differs from room "DIRTY".
export function floorMapColor({ roomStatus, taskStatus }) {
  if (roomStatus === "OUT_OF_ORDER") return { bg: "#ef4444", text: "#ffffff" };
  if (roomStatus === "OCCUPIED")     return { bg: "#1a6b6b", text: "#ffffff" };
  if (taskStatus === "INSPECTED")    return { bg: "#3b82f6", text: "#ffffff" };
  if (taskStatus === "IN_PROGRESS")  return { bg: "#f97316", text: "#ffffff" };
  if (roomStatus === "DIRTY")        return { bg: "#f59e0b", text: "#ffffff" };
  if (roomStatus === "CLEAN" || taskStatus === "DONE")
    return { bg: "#10b981", text: "#ffffff" };
  return { bg: "#f1f5f9", text: "#64748b" }; // VACANT
}

export function daysBetween(fromIso, to = new Date()) {
  if (!fromIso) return 0;
  const from = new Date(fromIso);
  const diff = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}
