import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  RefreshCw,
  PlaneLanding,
  Plane,
  Home,
  Moon,
} from "lucide-react";

import PageWrapper from "../components/layout/PageWrapper.jsx";
import LegacyButton from "../components/ui/LegacyButton.jsx";
import KPICard from "../components/ui/KPICard.jsx";
import Modal from "../components/layout/Modal.jsx";
import {
  useArrivals,
  useDepartures,
  useInHouse,
  useAddNoteMutation,
} from "../hooks/useFrontDesk.js";
import { roomsApi } from "../api/rooms.js";
import { useQuery } from "@tanstack/react-query";

import ArrivalCard from "../components/frontdesk/ArrivalCard.jsx";
import DepartureCard from "../components/frontdesk/DepartureCard.jsx";
import CheckInModal from "../components/frontdesk/CheckInModal.jsx";
import CheckOutModal from "../components/frontdesk/CheckOutModal.jsx";
import FolioDrawer from "../components/frontdesk/FolioDrawer.jsx";
import WalkInModal from "../components/frontdesk/WalkInModal.jsx";
import InHouseList from "../components/frontdesk/InHouseList.jsx";
import NightAuditPanel from "../components/frontdesk/NightAuditPanel.jsx";
import QuickActionsPanel from "../components/frontdesk/QuickActionsPanel.jsx";
import { formatCurrency } from "../components/frontdesk/utils.js";
import { assignRoom as assignRoomApi } from "../api/frontdesk.js";

export default function FrontDesk() {
  const qc = useQueryClient();
  const { data: arrivals = [], isLoading: arrL } = useArrivals();
  const { data: departures = [], isLoading: depL } = useDepartures();
  const { data: inHouse = [] } = useInHouse();
  const [tab, setTab] = useState("arrivals");
  const [qArr, setQArr] = useState("");
  const [fArr, setFArr] = useState("all");
  const [qDep, setQDep] = useState("");
  const [fDep, setFDep] = useState("all");
  const [sortArr, setSortArr] = useState("name");

  const [checkInRes, setCheckInRes] = useState(null);
  const [checkOutRes, setCheckOutRes] = useState(null);
  const [folio, setFolio] = useState({ id: null, name: "" });
  const [walkIn, setWalkIn] = useState(false);
  const [assignRes, setAssignRes] = useState(null);
  const [quick, setQuick] = useState(null);
  const [now, setNow] = useState(new Date());
  const noteM = useAddNoteMutation();

  const { data: allRooms = [] } = useQuery({
    queryKey: ["rooms", "all"],
    queryFn: () => roomsApi.list(),
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const inHouseCount = inHouse.length;
  const pendingArrivals = useMemo(
    () => arrivals.filter((a) => a.status === "CONFIRMED").length,
    [arrivals],
  );
  const pendingDep = useMemo(
    () => departures.filter((d) => Number(d.balanceDue) > 0.02).length,
    [departures],
  );
  const totalDue = useMemo(
    () =>
      inHouse.reduce((s, r) => s + Number(r.balanceDue || 0), 0),
    [inHouse],
  );

  const filteredArrivals = useMemo(() => {
    let r = [...arrivals];
    const q = qArr.trim().toLowerCase();
    if (q) {
      r = r.filter((row) => {
        const n = `${row.guest?.firstName} ${row.guest?.lastName}`.toLowerCase();
        return n.includes(q);
      });
    }
    if (fArr === "assigned") r = r.filter((x) => x.roomId);
    if (fArr === "unassigned") r = r.filter((x) => !x.roomId);
    if (fArr === "vip") r = r.filter((x) => x.vipGuest);
    if (fArr === "early") r = r.filter((x) => x.isEarlyCheckIn);
    if (sortArr === "name")
      r.sort((a, b) =>
        (a.guest?.lastName || "").localeCompare(b.guest?.lastName || ""),
      );
    if (sortArr === "room")
      r.sort((a, b) => (a.room?.number || "").localeCompare(b.room?.number || ""));
    if (sortArr === "time")
      r.sort(
        (a, b) => new Date(a.checkIn) - new Date(b.checkIn),
      );
    return r;
  }, [arrivals, qArr, fArr, sortArr]);

  const filteredDepartures = useMemo(() => {
    let r = [...departures];
    const q = qDep.trim().toLowerCase();
    if (q) {
      r = r.filter((row) => {
        const n = `${row.guest?.firstName} ${row.guest?.lastName}`.toLowerCase();
        return n.includes(q);
      });
    }
    if (fDep === "bal") r = r.filter((x) => Number(x.balanceDue) > 0.02);
    if (fDep === "late") r = r.filter((x) => x.lateCheckOut);
    if (fDep === "vip") r = r.filter((x) => x.vipGuest);
    return r;
  }, [departures, qDep, fDep]);

  const allIn =
    !arrL &&
    arrivals.length > 0 &&
    arrivals.every((a) => a.status !== "CONFIRMED");

  async function onAddNoteForArrival(text, row) {
    if (!text?.trim()) return;
    try {
      await noteM.mutateAsync({ id: row.id, data: { note: text } });
      toast.success("Note saved");
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  }

  return (
    <PageWrapper
      title="Front Desk"
      description={`${format(now, "EEEE, MMM d, yyyy")} · ${format(now, "h:mm a")} · ${inHouseCount} guests in house`}
      actions={
        <>
          <LegacyButton variant="gold" type="button" onClick={() => setWalkIn(true)}>
            + Walk-in
          </LegacyButton>
          <LegacyButton
            variant="secondary"
            type="button"
            onClick={() => {
              setTab("audit");
              qc.invalidateQueries({ queryKey: ["frontdesk"] });
            }}
          >
            Night audit
          </LegacyButton>
          <LegacyButton
            variant="ghost"
            type="button"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={() => qc.invalidateQueries({ queryKey: ["frontdesk"] })}
          >
            Refresh
          </LegacyButton>
        </>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Arrivals today"
          value={arrivals.length}
          hint={`${pendingArrivals} pending`}
        />
        <KPICard
          label="Departures today"
          value={departures.length}
          hint={`${pendingDep} with balance`}
        />
        <KPICard
          label="In house"
          value={inHouseCount}
        />
        <KPICard
          label="Balance due (in house)"
          value={formatCurrency(totalDue)}
          className={totalDue > 0 ? "ring-1 ring-rose-500/30" : ""}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-navy-800">
        {[
          { id: "arrivals", label: "Arrivals", icon: PlaneLanding, c: filteredArrivals.length },
          { id: "departures", label: "Departures", icon: Plane, c: filteredDepartures.length },
          { id: "inhouse", label: "In house", icon: Home, c: inHouseCount },
          { id: "audit", label: "Night audit", icon: Moon, c: null },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              "flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium",
              tab === t.id
                ? "border-teal text-teal-light"
                : "border-transparent text-slate-500 hover:text-slate-200",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.c != null && (
              <span className="rounded-full bg-navy-700 px-1.5 text-xs">{t.c}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "arrivals" && (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Search name"
              className="h-9 max-w-xs rounded-md border border-navy-600 bg-navy-800/40 px-3 text-sm"
              value={qArr}
              onChange={(e) => setQArr(e.target.value)}
            />
            {["all", "assigned", "unassigned", "vip", "early"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFArr(f)}
                className={clsx(
                  "rounded-md px-2 py-1 text-xs capitalize",
                  fArr === f ? "bg-teal/20 text-teal-light" : "text-slate-500",
                )}
              >
                {f}
              </button>
            ))}
            <span className="text-xs text-slate-600">Sort:</span>
            {["name", "room", "time"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSortArr(s)}
                className={clsx(
                  "text-xs",
                  sortArr === s ? "text-teal-light" : "text-slate-500",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {allIn && (
            <p className="mb-4 text-center text-emerald-400">
              All arrivals processed ✓
            </p>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredArrivals.map((row) => (
              <ArrivalCard
                key={row.id}
                row={row}
                onCheckIn={setCheckInRes}
                onViewFolio={(r) =>
                  setFolio({
                    id: r.id,
                    name: `${r.guest?.firstName} ${r.guest?.lastName}`,
                  })
                }
                onAssignRoom={setAssignRes}
                onAddNote={(text) => onAddNoteForArrival(text, row)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "departures" && (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="search"
              className="h-9 max-w-xs rounded-md border border-navy-600 bg-navy-800/40 px-3 text-sm"
              placeholder="Search"
              value={qDep}
              onChange={(e) => setQDep(e.target.value)}
            />
            {["all", "bal", "late", "vip"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFDep(f)}
                className={clsx(
                  "rounded-md px-2 py-1 text-xs",
                  fDep === f ? "bg-teal/20 text-teal-light" : "text-slate-500",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {filteredDepartures.length === 0 && !depL && (
            <p className="text-center text-emerald-400">All departures processed ✓</p>
          )}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {filteredDepartures.map((row) => (
              <DepartureCard
                key={row.id}
                row={row}
                onCheckOut={setCheckOutRes}
                onViewFolio={(r) =>
                  setFolio({
                    id: r.id,
                    name: `${r.guest?.firstName} ${r.guest?.lastName}`,
                  })
                }
                onLateFee={() => toast("Apply late fee via Quick actions")}
                onAddCharge={() => toast("Use folio to post charge")}
                onAddNote={() => toast("Use card menu")}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "inhouse" && (
        <InHouseList
          onFolio={(r) =>
            setFolio({
              id: r.id,
              name: `${r.guest?.firstName} ${r.guest?.lastName}`,
            })
          }
          onAddCharge={() => toast("Open folio to add charge")}
          onNote={() => toast("Use quick actions or arrival card")}
          onQuick={setQuick}
          onEarly={(row) => {
            setQuick(row);
            toast("Set new date in Quick actions");
          }}
        />
      )}

      {tab === "audit" && <NightAuditPanel />}

      <CheckInModal
        open={Boolean(checkInRes)}
        onClose={() => setCheckInRes(null)}
        reservation={checkInRes}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["frontdesk"] })}
      />
      <CheckOutModal
        open={Boolean(checkOutRes)}
        onClose={() => setCheckOutRes(null)}
        reservation={checkOutRes}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["frontdesk"] })}
      />
      <FolioDrawer
        open={Boolean(folio.id)}
        onClose={() => setFolio({ id: null, name: "" })}
        reservationId={folio.id}
        guestName={folio.name}
      />
      <WalkInModal
        open={walkIn}
        onClose={() => setWalkIn(false)}
        onCheckInStart={() => {}}
      />
      <QuickActionsPanel
        open={Boolean(quick)}
        onClose={() => setQuick(null)}
        row={quick}
        allRooms={allRooms}
      />

      <Modal
        open={Boolean(assignRes)}
        onClose={() => setAssignRes(null)}
        title="Assign room"
        size="md"
      >
        {assignRes && (
          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {allRooms
              .filter(
                (r) =>
                  r.roomTypeId === assignRes.roomTypeId &&
                  ["VACANT", "CLEAN", "DUE_IN"].includes(r.status),
              )
              .map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="rounded border border-navy-600 p-2 text-left text-sm hover:border-teal"
                  onClick={async () => {
                    try {
                      await assignRoomApi(assignRes.id, r.id);
                      toast.success(`Room ${r.number} assigned`);
                      setAssignRes(null);
                      qc.invalidateQueries({ queryKey: ["frontdesk"] });
                    } catch (e) {
                      toast.error(e?.response?.data?.message ?? "Failed");
                    }
                  }}
                >
                  {r.number}
                  <span className="block text-xs text-slate-500">{r.status}</span>
                </button>
              ))}
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
