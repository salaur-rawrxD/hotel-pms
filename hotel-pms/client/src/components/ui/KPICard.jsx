import { KPICard as KpiInner } from "./kpi-card.jsx";

/**
 * Default export adapter: label/hint props match older Front Desk page usage.
 */
export default function KPICard({ label, value, hint, ...rest }) {
  return <KpiInner title={label} value={value} subtitle={hint} {...rest} />;
}
