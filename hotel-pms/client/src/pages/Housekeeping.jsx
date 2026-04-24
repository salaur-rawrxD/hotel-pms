import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
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
import { Button } from "../components/ui/button.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs.jsx";
import {
  useAssignments,
  useInspectionQueue,
  useMaintenanceRequests,
  useRefreshHousekeeping,
} from "../hooks/useHousekeeping.js";
import { formatDate } from "../utils/formatDate.js";

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
    toast(`Select a staff member to assign Room ${room.number}`);
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="page-header no-print">
        <div>
          <h1 className="page-title">Housekeeping</h1>
          <p className="page-subtitle">
            Operations board · {formatDate(new Date())}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer />
            Print
          </Button>
        </div>
      </header>

      <PrintAssignmentSheet data={assignments.data} />

      <Tabs defaultValue="assignments" className="no-print">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="assignments">
            <Home className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="floor-map">
            <MapIcon className="h-4 w-4" />
            Floor Map
          </TabsTrigger>
          <TabsTrigger value="inspection">
            <Eye className="h-4 w-4" />
            Inspection
            {inspectionBadge > 0 && (
              <span className="tab-badge bg-blue-500 text-white">
                {inspectionBadge}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4" />
            Maintenance
            {maintBadge > 0 && (
              <span className="tab-badge bg-rose-500 text-white">
                {maintBadge}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="lost-found">
            <Search className="h-4 w-4" />
            Lost &amp; Found
          </TabsTrigger>
          <TabsTrigger value="supplies">
            <Package className="h-4 w-4" />
            Supplies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <HousekeepingStats />
          <StaffAssignmentBoard
            onOpenTask={openDrawer}
            onAssignRoom={handleAssignRoom}
          />
        </TabsContent>
        <TabsContent value="floor-map">
          <FloorMapView onOpenTask={openDrawer} />
        </TabsContent>
        <TabsContent value="inspection">
          <InspectionQueue />
        </TabsContent>
        <TabsContent value="maintenance">
          <MaintenanceBoard />
        </TabsContent>
        <TabsContent value="lost-found">
          <LostAndFoundLog />
        </TabsContent>
        <TabsContent value="supplies">
          <SupplyRequestForm />
        </TabsContent>
      </Tabs>

      <RoomTaskDrawer
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onClose={closeDrawer}
      />
    </div>
  );
}
