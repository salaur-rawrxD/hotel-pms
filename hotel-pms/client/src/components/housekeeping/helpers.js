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
  PENDING:     { label: "Pending",     cls: "task-pending",     icon: "⏳" },
  IN_PROGRESS: { label: "In Progress", cls: "task-in-progress", icon: "🔄" },
  INSPECTED:   { label: "Ready",       cls: "task-inspected",   icon: "👁" },
  DONE:        { label: "Done",        cls: "task-done",        icon: "✅" },
};

export const TASK_TYPE_META = {
  CHECKOUT:   { label: "Checkout",   cls: "bg-orange-100 text-orange-700" },
  STAY_OVER:  { label: "Stay-Over",  cls: "bg-blue-100 text-blue-700" },
  DEEP_CLEAN: { label: "Deep Clean", cls: "bg-purple-100 text-purple-700" },
};

export const SEVERITY_META = {
  LOW:    { label: "Low",    cls: "severity-low" },
  MEDIUM: { label: "Medium", cls: "severity-medium" },
  HIGH:   { label: "High",   cls: "severity-high" },
};

export const URGENCY_META = {
  NORMAL: { label: "Normal", cls: "urgency-normal" },
  URGENT: { label: "Urgent", cls: "urgency-urgent" },
};

export const LF_STATUS_META = {
  UNCLAIMED: { label: "Unclaimed", cls: "laf-status-unclaimed" },
  CLAIMED:   { label: "Claimed",   cls: "laf-status-claimed" },
  RETURNED:  { label: "Returned",  cls: "laf-status-returned" },
  DONATED:   { label: "Donated",   cls: "laf-status-donated" },
};

// Returns the CSS class from index.css for a given operational state.
export function floorMapClass({ roomStatus, taskStatus }) {
  if (roomStatus === "OUT_OF_ORDER") return "OUT_OF_ORDER";
  if (roomStatus === "OCCUPIED")     return "OCCUPIED";
  if (taskStatus === "INSPECTED")    return "INSPECTED";
  if (taskStatus === "IN_PROGRESS")  return "IN_PROGRESS";
  if (roomStatus === "DIRTY")        return "DIRTY";
  if (roomStatus === "CLEAN" || taskStatus === "DONE") return "CLEAN";
  return "VACANT";
}

export function daysBetween(fromIso, to = new Date()) {
  if (!fromIso) return 0;
  const from = new Date(fromIso);
  const diff = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}
