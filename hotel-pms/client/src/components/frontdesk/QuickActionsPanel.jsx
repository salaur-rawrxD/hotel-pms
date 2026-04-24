import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../layout/Modal.jsx";
import Button from "../ui/Button.jsx";
import { useQuickActionMutation } from "../../hooks/useFrontDesk.js";
import { useAuthStore } from "../../store/authStore.js";
import { USER_ROLES } from "../../constants/userRoles.js";

export default function QuickActionsPanel({ open, onClose, row, allRooms = [] }) {
  const m = useQuickActionMutation();
  const canMove = useAuthStore((s) =>
    s.hasRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  );
  const [wakeTime, setWakeTime] = useState("07:00");
  const [lateFee, setLateFee] = useState("50");
  const [newRoom, setNewRoom] = useState("");
  const [newCo, setNewCo] = useState("");

  if (!row) return null;
  const cards = row.keyCards?.length ?? 0;

  async function act(payload) {
    try {
      await m.mutateAsync({ id: row.id, data: payload });
      toast.success("Updated");
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Quick actions — room ${row.room?.number}`}
      size="md"
    >
      <div className="space-y-4 text-sm text-slate-200">
        <div className="flex items-center justify-between">
          <span>Do not disturb</span>
          <input
            type="checkbox"
            checked={row.doNotDisturb}
            onChange={() => act({ action: "doNotDisturb" })}
          />
        </div>
        <div>
          <p>Key cards issued: {cards}</p>
          <Button
            size="sm"
            type="button"
            onClick={() => act({ action: "issueNewKey" })}
          >
            Issue key
          </Button>
        </div>
        <div>
          <p className="text-xs text-slate-500">Wake-up</p>
          <input
            type="time"
            className="mr-2 rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
          />
          <Button
            size="sm"
            type="button"
            onClick={() => {
              const t = new Date();
              const [h, min] = wakeTime.split(":").map(Number);
              t.setHours(h, min, 0, 0);
              act({ action: "addWakeUpCall", scheduledFor: t.toISOString() });
            }}
          >
            Set alarm
          </Button>
        </div>
        <div>
          <p className="text-xs text-slate-500">Late checkout (fee {lateFee})</p>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={row.lateCheckOut}
              onChange={() =>
                act({ action: "lateCheckOut", enabled: !row.lateCheckOut, fee: Number(lateFee) || 50 })
              }
            />
            <input
              className="w-20 rounded border border-navy-600 bg-navy-900/40 px-1"
              value={lateFee}
              onChange={(e) => setLateFee(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>VIP</span>
          <input
            type="checkbox"
            checked={row.vipGuest}
            onChange={() => act({ action: "vipGuest" })}
          />
        </div>
        {canMove && (
          <div>
            <p className="text-xs text-slate-500">Move room (manager)</p>
            <select
              className="mt-1 w-full rounded border border-navy-600 bg-navy-900/40"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
            >
              <option value="">Select room</option>
              {allRooms
                .filter(
                  (r) =>
                    r.roomTypeId === row.roomTypeId &&
                    (r.id === row.roomId ||
                      ["VACANT", "CLEAN", "DUE_IN"].includes(r.status)),
                )
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.number} — {r.status}
                  </option>
                ))}
            </select>
            <Button
              className="mt-2"
              size="sm"
              type="button"
              onClick={() => {
                if (!newRoom) return;
                act({ action: "moveRoom", roomId: newRoom });
              }}
            >
              Move
            </Button>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500">Early departure (new check-out date)</p>
          <input
            type="date"
            className="rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={newCo}
            onChange={(e) => setNewCo(e.target.value)}
          />
          <Button
            className="ml-2"
            size="sm"
            type="button"
            onClick={() => {
              if (!newCo) return;
              act({
                action: "earlyDeparture",
                newCheckOut: new Date(newCo).toISOString(),
              });
            }}
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}
