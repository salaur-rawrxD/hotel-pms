import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BedDouble,
  DollarSign,
  LogIn,
  LogOut,
  TrendingUp,
} from "lucide-react";

import { useCountUp } from "../../hooks/useCountUp.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const TONE_STYLES = {
  teal:   { bg: "#e6f4f4", fg: "#0f766e" },
  gold:   { bg: "#fdf4dc", fg: "#92620c" },
  navy:   { bg: "#e2e8f0", fg: "#0f1c2e" },
  green:  { bg: "#dcfce7", fg: "#166534" },
  orange: { bg: "#ffedd5", fg: "#9a3412" },
};

function KPICard({ label, value, sub, subTone, icon: Icon, tone }) {
  const palette = TONE_STYLES[tone] ?? TONE_STYLES.teal;
  return (
    <div
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{ minHeight: "134px" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p
            className="mt-2 font-serif text-[2rem] font-bold leading-none tracking-tight"
            style={{ color: "#0f1c2e" }}
          >
            {value}
          </p>
        </div>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: palette.bg, color: palette.fg }}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {sub && (
        <p
          className="mt-3 flex items-center gap-1 text-xs"
          style={{ color: subTone ?? "#64748b" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function SkelBar({ className }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

function KPICardSkeleton() {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      style={{ minHeight: "134px" }}
    >
      <SkelBar className="h-3 w-20" />
      <SkelBar className="mt-3 h-8 w-28" />
      <SkelBar className="mt-4 h-3 w-24" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function CurrencyCountUp({ amount }) {
  const v = useCountUp(amount);
  return <>{formatCurrency(v)}</>;
}

function NumberCountUp({ value, suffix = "" }) {
  const v = useCountUp(value);
  const rounded = Math.round(v);
  return (
    <>
      {rounded}
      {suffix}
    </>
  );
}

function PercentCountUp({ value }) {
  // Accepts "14.6" or 14.6 — animates to the numeric value, preserves 1 decimal.
  const target = Number(value) || 0;
  const v = useCountUp(target);
  return <>{v.toFixed(1)}%</>;
}

// ─────────────────────────────────────────────────────────────

export default function KPIBar({ summary, isLoading }) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { occupancy, revenue, traffic, adr, revpar } = summary;

  const revDelta = (revenue?.todayRevenue ?? 0) - (revenue?.yesterdayRevenue ?? 0);
  const revPositive = revDelta >= 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <KPICard
        label="Occupancy"
        value={<PercentCountUp value={occupancy?.occupancyPercent ?? 0} />}
        sub={`${occupancy?.occupiedRooms ?? 0} of ${occupancy?.totalRooms ?? 0} rooms`}
        icon={BedDouble}
        tone="teal"
      />
      <KPICard
        label="Today's Revenue"
        value={<CurrencyCountUp amount={revenue?.todayRevenue ?? 0} />}
        sub={
          <>
            {revPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" style={{ color: "#dc2626" }} />
            )}
            <span>
              {revPositive ? "+" : "-"}
              {formatCurrency(Math.abs(revDelta))} vs yesterday
            </span>
          </>
        }
        subTone={revPositive ? "#166534" : "#991b1b"}
        icon={DollarSign}
        tone="gold"
      />
      <KPICard
        label="ADR"
        value={<CurrencyCountUp amount={adr?.value ?? 0} />}
        sub="Average daily rate"
        icon={TrendingUp}
        tone="teal"
      />
      <KPICard
        label="RevPAR"
        value={<CurrencyCountUp amount={revpar?.value ?? 0} />}
        sub="Revenue per available room"
        icon={BarChart3}
        tone="navy"
      />
      <KPICard
        label="Arrivals"
        value={<NumberCountUp value={traffic?.arrivalsToday ?? 0} />}
        sub="Checking in today"
        icon={LogIn}
        tone="green"
      />
      <KPICard
        label="Departures"
        value={<NumberCountUp value={traffic?.departuresToday ?? 0} />}
        sub="Checking out today"
        icon={LogOut}
        tone="orange"
      />
    </div>
  );
}
