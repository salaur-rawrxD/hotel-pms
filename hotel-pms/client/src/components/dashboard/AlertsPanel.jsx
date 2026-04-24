import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

import { formatRelative } from "../../utils/formatDate.js";

const SEVERITY_STYLES = {
  high:   { border: "#ef4444", bg: "#fef2f2", icon: AlertTriangle, iconColor: "#dc2626" },
  medium: { border: "#f59e0b", bg: "#fffbeb", icon: Bell,          iconColor: "#b45309" },
  low:    { border: "#94a3b8", bg: "#f8fafc", icon: Info,          iconColor: "#64748b" },
};

function AlertItem({ alert, onDismiss }) {
  const s = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.low;
  const Icon = s.icon;
  return (
    <li
      className="flex items-start gap-3 rounded-lg border-l-4 px-3 py-2.5"
      style={{ borderLeftColor: s.border, background: s.bg }}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: s.iconColor }} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-navy-900">{alert.message}</p>
        {alert.createdAt && (
          <p className="mt-0.5 text-[11px] text-slate-500">
            {formatRelative(alert.createdAt)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

export default function AlertsPanel({ alerts, isLoading }) {
  const [dismissed, setDismissed] = useState(() => new Set());

  // When the list from the server changes, drop dismissals that no longer
  // appear in the feed so they reappear if the condition recurs later.
  useEffect(() => {
    if (!alerts) return;
    setDismissed((prev) => {
      const next = new Set();
      for (const id of prev) {
        if (alerts.some((a) => a.id === id)) next.add(id);
      }
      return next;
    });
  }, [alerts]);

  const visible = useMemo(
    () => (alerts ?? []).filter((a) => !dismissed.has(a.id)),
    [alerts, dismissed],
  );

  const highCount = visible.filter((a) => a.severity === "high").length;

  const dismiss = (id) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  return (
    <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-navy-900">
          Action Required
        </h3>
        {highCount > 0 && (
          <span
            className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ background: "#fee2e2", color: "#991b1b" }}
          >
            {highCount}
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="mt-2 text-sm font-medium text-navy-900">All clear</p>
          <p className="mt-0.5 text-xs text-slate-500">No action needed</p>
        </div>
      ) : (
        <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {visible.map((a) => (
            <AlertItem key={a.id} alert={a} onDismiss={dismiss} />
          ))}
        </ul>
      )}
    </section>
  );
}
