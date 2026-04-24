import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  Percent,
} from "lucide-react";

import PageWrapper from "../components/layout/PageWrapper.jsx";
import Card from "../components/ui/Card.jsx";
import KPICard from "../components/ui/KPICard.jsx";

export default function Dashboard() {
  return (
    <PageWrapper
      title="Dashboard"
      description="Real-time overview of your property performance."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Occupancy" value="—" hint="Today" icon={Percent} />
        <KPICard label="ADR" value="—" hint="Average daily rate" icon={DollarSign} />
        <KPICard label="RevPAR" value="—" hint="Today" icon={DollarSign} />
        <KPICard label="Arrivals" value="—" hint="Expected today" icon={CalendarCheck} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Room status" className="lg:col-span-2">
          <p className="text-sm text-slate-400">
            Room status grid will appear here once the dashboard feature is built.
          </p>
        </Card>
        <Card title="Today's activity">
          <p className="text-sm text-slate-400">
            Arrivals, departures and in-house counts will stream in here.
          </p>
        </Card>
      </div>

      <Card
        title="Scaffold status"
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-teal/15 px-3 py-1 text-xs text-teal-light">
            <BedDouble className="h-3.5 w-3.5" /> Ready to build
          </span>
        }
      >
        <ul className="space-y-2 text-sm text-slate-300">
          <li>✓ Routing + protected routes configured</li>
          <li>✓ Tailwind theme + fonts wired in</li>
          <li>✓ React Query + Zustand stores ready</li>
          <li>✓ Axios client with auth interceptors</li>
          <li>✓ API modules scaffolded for every resource</li>
        </ul>
      </Card>
    </PageWrapper>
  );
}
