import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "../../lib/utils.js";
import { Skeleton } from "./skeleton.jsx";

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-teal/10",
  iconColor = "text-teal",
  delta,
  deltaUp,
  loading = false,
  className,
}) {
  if (loading) {
    return (
      <div className={cn("kpi-card", className)}>
        <Skeleton className="h-9 w-9 rounded-lg mb-3" />
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div className={cn("kpi-card animate-fade-in", className)}>
      {Icon && (
        <div className={cn("kpi-icon-wrap", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      )}
      <div className="kpi-value">{value ?? "—"}</div>
      <div className="kpi-label">{title}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
      {delta != null && (
        <div className={cn("kpi-delta", deltaUp ? "up" : "down")}>
          {deltaUp ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {delta}
        </div>
      )}
    </div>
  );
}

export { KPICard };
