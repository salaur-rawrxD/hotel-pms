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

const TEAL = "hsl(173, 60%, 26%)";
const GOLD = "hsl(40, 58%, 54%)";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-teal">{formatCurrency(v)}</p>
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
      <section className="section-card">
        <header className="section-card-header">
          <h3 className="section-card-title">Revenue — Last 14 Days</h3>
        </header>
        <div className="section-card-body">
          <div className="h-60 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    );
  }

  return (
    <section className="section-card">
      <header className="section-card-header">
        <div>
          <h3 className="section-card-title">Revenue — Last 14 Days</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Total posted to guest folios
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Period total
          </p>
          <p className="font-serif text-xl font-bold leading-none text-amber-700">
            {formatCurrency(total)}
          </p>
        </div>
      </header>

      <div className="section-card-body">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
              onMouseLeave={() => setHoverIdx(-1)}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(215 14% 46%)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(215 14% 46%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrencyShort}
                width={56}
              />
              <Tooltip
                cursor={{ fill: "hsl(215 42% 13% / 0.04)" }}
                content={<TooltipContent />}
              />
              <Bar
                dataKey="revenue"
                radius={[4, 4, 0, 0]}
                onMouseOver={(_d, idx) => setHoverIdx(idx)}
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
      </div>
    </section>
  );
}
