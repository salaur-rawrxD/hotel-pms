import { useMemo, useState } from "react";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import toast from "react-hot-toast";
import {
  BedDouble,
  Eye,
  Home,
  Map as MapIcon,
  Package,
  Printer,
  RefreshCw,
  Search,
  Wrench,
} from "lucide-react";

import FloorMapView from "../components/housekeeping/FloorMapView.jsx";
import HousekeepingStats from "../components/housekeeping/HousekeepingStats.jsx";
import InspectionQueue from "../components/housekeeping/InspectionQueue.jsx";
import LostAndFoundLog from "../components/housekeeping/LostAndFoundLog.jsx";
import MaintenanceBoard from "../components/housekeeping/MaintenanceBoard.jsx";
import RoomTaskDrawer from "../components/housekeeping/RoomTaskDrawer.jsx";
import StaffAssignmentBoard from "../components/housekeeping/StaffAssignmentBoard.jsx";
import SupplyRequestForm from "../components/housekeeping/SupplyRequestForm.jsx";
import {
  useAssignments,
  useInspectionQueue,
  useMaintenanceRequests,
  useRefreshHousekeeping,
} from "../hooks/useHousekeeping.js";
import { formatDate } from "../utils/formatDate.js";

function TabButton({ icon: Icon, label, badge, badgeTone = "blue", selected }) {
  const toneClass =
    badgeTone === "rose"
      ? "bg-rose-500 text-white"
      : badgeTone === "amber"
      ? "bg-amber-500 text-white"
      : "bg-blue-500 text-white";
  return (
    <div
      className={clsx(
        "group inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none",
        selected
          ? "bg-white text-navy-900 shadow-sm ring-1 ring-slate-200"
          : "text-slate-600 hover:bg-white/60 hover:text-navy-900",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {typeof badge === "number" && badge > 0 && (
        <span
          className={clsx(
            "ml-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            toneClass,
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function PrintAssignmentSheet({ data }) {
  if (!data) return null;
  return (
    <div className="print-assignment-sheet hidden">
      <h1 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>
        Housekeeping Assignments
      </h1>
      <p style={{ color: "#64748b", marginTop: 0, marginBottom: 12 }}>
        {formatDate(new Date())}
      </p>
      {data.assignments.map((staff) => (
        <div key={staff.staffId} style={{ marginBottom: 18, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 14, margin: "8px 0" }}>
            {staff.staffName}{" "}
            <span style={{ color: "#64748b", fontWeight: 400 }}>
              ({staff.stats.done}/{staff.stats.total} done)
            </span>
          </h2>
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Task</th>
                <th>Status</th>
                <th>Guest</th>
                <th>Check-out</th>
              </tr>
            </thead>
            <tbody>
              {staff.tasks.map((t) => (
                <tr key={t.id}>
                  <td>{t.roomNumber}</td>
                  <td>{t.floor}</td>
                  <td>{t.roomType ?? "—"}</td>
                  <td>{t.taskType}</td>
                  <td>{t.status}</td>
                  <td>{t.guestName ?? ""}</td>
                  <td>
                    {t.checkOut
                      ? new Date(t.checkOut).toLocaleDateString()
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default function Housekeeping() {
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const assignments = useAssignments();
  const inspection = useInspectionQueue();
  const maintenance = useMaintenanceRequests();
  const refresh = useRefreshHousekeeping();
  const [refreshing, setRefreshing] = useState(false);

  const inspectionBadge = inspection.data?.length ?? 0;
  const maintBadge = useMemo(
    () =>
      (maintenance.data ?? []).filter(
        (m) => m.status !== "RESOLVED" && m.status !== "CLOSED",
      ).length,
    [maintenance.data],
  );

  const openDrawer = (taskId) => setSelectedTaskId(taskId);
  const closeDrawer = () => setSelectedTaskId(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      toast.success("Refreshed");
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAssignRoom = (room) => {
    // A lightweight assign flow — just toast-and-hint for now; a full modal
    // would take a staff picker. The assign endpoint is fully wired up.
    toast(`Select a staff member to assign Room ${room.number}`, { icon: "👷" });
  };

  return (
    <div className="page-wrapper space-y-6 pb-8">
      {/* Page header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between no-print">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy-900">
            Housekeeping
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Today's operations — {formatDate(new Date())}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800"
          >
            <Printer className="h-4 w-4" />
            Print Assignment Sheet
          </button>
        </div>
      </header>

      {/* Print-only view: assignment sheet */}
      <PrintAssignmentSheet data={assignments.data} />

      {/* Tab navigation */}
      <Tab.Group>
        <Tab.List className="no-print flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          <Tab as="button" className="focus:outline-none">
            {({ selected }) => (
              <TabButton icon={Home} label="Assignments" selected={selected} />
            )}
          </Tab>
          <Tab as="button" className="focus:outline-none">
            {({ selected }) => (
              <TabButton icon={MapIcon} label="Floor Map" selected={selected} />
            )}
          </Tab>
          <Tab as="button" className="focus:outline-none">
            {({ selected }) => (
              <TabButton
                icon={Eye}
                label="Inspection Queue"
                badge={inspectionBadge}
                badgeTone="blue"
                selected={selected}
              />
            )}
          </Tab>
          <Tab as="button" className="focus:outline-none">
            {({ selected }) => (
              <TabButton
                icon={Wrench}
                label="Maintenance"
                badge={maintBadge}
                badgeTone="rose"
                selected={selected}
              />
            )}
          </Tab>
          <Tab as="button" className="focus:outline-none">
            {({ selected }) => (
              <TabButton icon={Search} label="Lost & Found" selected={selected} />
            )}
          </Tab>
          <Tab as="button" className="focus:outline-none">
            {({ selected }) => (
              <TabButton icon={Package} label="Supplies" selected={selected} />
            )}
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-6 no-print">
          <Tab.Panel className="space-y-6 focus:outline-none">
            <HousekeepingStats />
            <StaffAssignmentBoard
              onOpenTask={openDrawer}
              onAssignRoom={handleAssignRoom}
            />
          </Tab.Panel>
          <Tab.Panel className="focus:outline-none">
            <FloorMapView onOpenTask={openDrawer} />
          </Tab.Panel>
          <Tab.Panel className="focus:outline-none">
            <InspectionQueue />
          </Tab.Panel>
          <Tab.Panel className="focus:outline-none">
            <MaintenanceBoard />
          </Tab.Panel>
          <Tab.Panel className="focus:outline-none">
            <LostAndFoundLog />
          </Tab.Panel>
          <Tab.Panel className="focus:outline-none">
            <SupplyRequestForm />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <RoomTaskDrawer
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onClose={closeDrawer}
      />
    </div>
  );
}
