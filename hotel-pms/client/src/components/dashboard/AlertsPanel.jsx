import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

import { cn } from "../../lib/utils.js";
import { formatRelative } from "../../utils/formatDate.js";
import { Button } from "../ui/button.jsx";

const SEVERITY_META = {
  high:   { cls: "alert-high",   Icon: AlertTriangle, iconClass: "text-red-600" },
  medium: { cls: "alert-medium", Icon: Bell,          iconClass: "text-amber-600" },
  low:    { cls: "alert-low",    Icon: Info,          iconClass: "text-slate-500" },
};

function AlertItem({ alert, onDismiss }) {
  const meta = SEVERITY_META[alert.severity] ?? SEVERITY_META.low;
  const Icon = meta.Icon;
  return (
    <li className={cn("flex items-start gap-3 rounded-md px-3 py-2.5", meta.cls)}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", meta.iconClass)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{alert.message}</p>
        {alert.createdAt && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatRelative(alert.createdAt)}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}

export default function AlertsPanel({ alerts, isLoading }) {
  const [dismissed, setDismissed] = useState(() => new Set());

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
    <section className="section-card flex h-full flex-col">
      <header className="section-card-header">
        <h3 className="section-card-title">Action Required</h3>
        {highCount > 0 && (
          <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            {highCount}
          </span>
        )}
      </header>

      <div className="section-card-body flex-1">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state py-10">
            <div className="empty-state-icon bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="empty-state-title">All clear</p>
            <p className="empty-state-desc">No action needed right now.</p>
          </div>
        ) : (
          <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {visible.map((a) => (
              <AlertItem key={a.id} alert={a} onDismiss={dismiss} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
