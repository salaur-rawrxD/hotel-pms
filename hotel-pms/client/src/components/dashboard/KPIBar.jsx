import {
  BarChart2,
  BedDouble,
  DollarSign,
  LogIn,
  LogOut,
  TrendingUp,
} from "lucide-react";

import { KPICard } from "../ui/kpi-card.jsx";
import { useCountUp } from "../../hooks/useCountUp.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

function CurrencyCountUp({ amount }) {
  const v = useCountUp(amount);
  return <>{formatCurrency(v)}</>;
}

function NumberCountUp({ value, suffix = "" }) {
  const v = useCountUp(value);
  return (
    <>
      {Math.round(v)}
      {suffix}
    </>
  );
}

function PercentCountUp({ value }) {
  const target = Number(value) || 0;
  const v = useCountUp(target);
  return <>{v.toFixed(1)}%</>;
}

export default function KPIBar({ summary, isLoading }) {
  if (isLoading || !summary) {
    return (
      <div className="kpi-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <KPICard key={i} loading />
        ))}
      </div>
    );
  }

  const { occupancy, revenue, traffic, adr, revpar } = summary;
  const revDelta = (revenue?.todayRevenue ?? 0) - (revenue?.yesterdayRevenue ?? 0);
  const revPositive = revDelta >= 0;

  return (
    <div className="kpi-grid">
      <KPICard
        title="Occupancy"
        value={<PercentCountUp value={occupancy?.occupancyPercent ?? 0} />}
        subtitle={`${occupancy?.occupiedRooms ?? 0} of ${occupancy?.totalRooms ?? 0} rooms`}
        icon={BedDouble}
        iconBg="bg-teal/10"
        iconColor="text-teal"
      />
      <KPICard
        title="Today's Revenue"
        value={<CurrencyCountUp amount={revenue?.todayRevenue ?? 0} />}
        icon={DollarSign}
        iconBg="bg-gold/10"
        iconColor="text-amber-700"
        delta={`${revPositive ? "+" : "-"}${formatCurrency(Math.abs(revDelta))} vs yesterday`}
        deltaUp={revPositive}
      />
      <KPICard
        title="ADR"
        value={<CurrencyCountUp amount={adr?.value ?? 0} />}
        subtitle="Average daily rate"
        icon={TrendingUp}
        iconBg="bg-teal/10"
        iconColor="text-teal"
      />
      <KPICard
        title="RevPAR"
        value={<CurrencyCountUp amount={revpar?.value ?? 0} />}
        subtitle="Revenue per available room"
        icon={BarChart2}
        iconBg="bg-slate-100"
        iconColor="text-slate-700"
      />
      <KPICard
        title="Arrivals"
        value={<NumberCountUp value={traffic?.arrivalsToday ?? 0} />}
        subtitle="Checking in today"
        icon={LogIn}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <KPICard
        title="Departures"
        value={<NumberCountUp value={traffic?.departuresToday ?? 0} />}
        subtitle="Checking out today"
        icon={LogOut}
        iconBg="bg-orange-50"
        iconColor="text-orange-600"
      />
    </div>
  );
}
