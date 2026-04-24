import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function KPICard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  className,
}) {
  const positive = typeof delta === "number" ? delta >= 0 : null;

  return (
    <div
      className={clsx(
        "rounded-xl border border-navy-700 bg-navy-800/60 p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-slate-50">
            {value ?? "—"}
          </p>
        </div>
        {Icon && (
          <span className="rounded-lg bg-teal/10 p-2 text-teal-light">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>

      {(hint || positive !== null) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {positive !== null && (
            <span
              className={clsx(
                "inline-flex items-center gap-0.5 font-medium",
                positive ? "text-emerald-400" : "text-rose-400",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-slate-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
