import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCurrency,
  formatCurrencyShort,
} from "../../utils/formatCurrency.js";

const TEAL = "#1a6b6b";
const GOLD = "#c9a84c";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-navy-900">{label}</p>
      <p className="mt-0.5" style={{ color: TEAL }}>
        {formatCurrency(v)}
      </p>
    </div>
  );
}

export default function RevenueChart({ data, isLoading }) {
  const [hoverIdx, setHoverIdx] = useState(-1);

  const total = useMemo(
    () => (data ?? []).reduce((acc, d) => acc + (Number(d.revenue) || 0), 0),
    [data],
  );

  if (isLoading || !data) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-navy-900">
            Revenue — Last 14 Days
          </h3>
        </header>
        <div className="h-60 w-full animate-pulse rounded-lg bg-slate-100" />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-navy-900">
            Revenue — Last 14 Days
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Total posted to guest folios
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Period total
          </p>
          <p
            className="font-serif text-2xl font-bold leading-none"
            style={{ color: GOLD }}
          >
            {formatCurrency(total)}
          </p>
        </div>
      </header>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
            onMouseLeave={() => setHoverIdx(-1)}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCurrencyShort}
              width={56}
            />
            <Tooltip
              cursor={{ fill: "rgba(15, 28, 46, 0.04)" }}
              content={<TooltipContent />}
            />
            <Bar
              dataKey="revenue"
              radius={[4, 4, 0, 0]}
              onMouseOver={(_data, idx) => setHoverIdx(idx)}
              isAnimationActive
              animationDuration={700}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={i === hoverIdx ? GOLD : TEAL} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
