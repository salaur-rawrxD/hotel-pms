import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { KeyRound, Star } from "lucide-react";

import Modal from "../layout/Modal.jsx";
import LegacyButton from "../ui/LegacyButton.jsx";
import { roomsApi } from "../../api/rooms.js";
import {
  useCheckInMutation,
  useAssignRoomMutation,
  useAddNoteMutation,
  useQuickActionMutation,
} from "../../hooks/useFrontDesk.js";
import { formatCurrency } from "./utils.js";

const PAY = ["CREDIT_CARD", "DEBIT_CARD", "CASH", "DIRECT_BILL", "OTA_COLLECT"];

export default function CheckInModal({ open, onClose, reservation, onSuccess }) {
  const [step, setStep] = useState(1);
  const [idOk, setIdOk] = useState(false);
  const [cardOk, setCardOk] = useState(false);
  const [policiesOk, setPoliciesOk] = useState(false);
  const [vip, setVip] = useState(false);
  const [notes, setNotes] = useState("");
  const [idType, setIdType] = useState("PASSPORT");
  const [idNumber, setIdNumber] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [payment, setPayment] = useState("CREDIT_CARD");
  const [keys, setKeys] = useState(1);
  const [regSigned, setRegSigned] = useState(false);
  const checkInM = useCheckInMutation();
  const assignM = useAssignRoomMutation();
  const noteM = useAddNoteMutation();
  const qm = useQuickActionMutation();

  const res = reservation;
  const g = res?.guest;

  useEffect(() => {
    if (open && res) {
      setStep(1);
      setVip(!!res.vipGuest);
      setSelectedRoomId(res.roomId || null);
    }
  }, [open, res]);

  useEffect(() => {
    if (open && step === 2 && res?.roomTypeId) {
      roomsApi
        .list()
        .then((list) => {
          const v = (list || []).filter(
            (r) =>
              r.roomTypeId === res.roomTypeId &&
              ["VACANT", "CLEAN", "DUE_IN"].includes(r.status),
          );
          setRooms(v);
        })
        .catch(() => setRooms([]));
    }
  }, [open, step, res?.roomTypeId]);

  const canNext1 = idOk && cardOk && policiesOk;
  const rate =
    res?.ratePlan != null
      ? Number(res.ratePlan.baseRate)
      : res?.roomType
        ? Number(res.roomType.baseRate)
        : 0;
  const nights = res
    ? Math.max(
        1,
        Math.round(
          (new Date(res.checkOut) - new Date(res.checkIn)) / 86400000,
        ) || 1,
      )
    : 0;
  const est = rate * nights * 1.14;

  async function complete() {
    if (!res) return;
    const finalRoomId = selectedRoomId || res.roomId;
    if (!finalRoomId) {
      toast.error("Assign a room first");
      return;
    }
    const roomNo =
      rooms.find((r) => r.id === finalRoomId)?.number ?? res.room?.number;
    try {
      if (selectedRoomId && selectedRoomId !== res.roomId) {
        await assignM.mutateAsync({ id: res.id, roomId: selectedRoomId });
      }
      if (vip && !res.vipGuest) {
        await qm.mutateAsync({ id: res.id, data: { action: "vipGuest", value: true } });
      }
      await checkInM.mutateAsync({
        id: res.id,
        data: {
          idVerified: true,
          paymentMethod: payment,
          keyCount: keys,
          extras: [],
        },
      });
      if (notes.trim()) {
        await noteM.mutateAsync({ id: res.id, data: { note: notes, type: "ARRIVAL" } });
      }
      onSuccess?.();
      toast.success(
        `✓ ${g?.firstName} ${g?.lastName} checked in to room ${roomNo ?? "—"}`,
      );
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Check-in failed");
    }
  }

  if (!res) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Guest check-in"
      size="lg"
      footer={null}
    >
      <div className="mb-6 flex gap-2 text-xs text-slate-400">
        {["Guest verification", "Room assignment", "Confirm & key"].map(
          (label, i) => (
            <div
              key={label}
              className={clsx(
                "flex flex-1 items-center justify-center rounded-md border px-2 py-1",
                step === i + 1
                  ? "border-teal text-teal-light"
                  : "border-navy-600",
              )}
            >
              {i + 1}. {label}
            </div>
          ),
        )}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            {g?.firstName} {g?.lastName} — {g?.email} — {g?.phone}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-slate-500">ID type</label>
            <input
              className="rounded-md border border-navy-600 bg-navy-900/40 px-2 py-1 text-sm"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
            />
            <label className="text-xs text-slate-500">ID number</label>
            <input
              className="rounded-md border border-navy-600 bg-navy-900/40 px-2 py-1 text-sm"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={idOk}
              onChange={(e) => setIdOk(e.target.checked)}
            />
            Photo ID verified
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cardOk}
              onChange={(e) => setCardOk(e.target.checked)}
            />
            Credit card presented
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={policiesOk}
              onChange={(e) => setPoliciesOk(e.target.checked)}
            />
            Guest informed of policies
          </label>
          {res.specialRequests && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-sm text-amber-100">
              {res.specialRequests}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={vip}
              onChange={(e) => setVip(e.target.checked)}
            />
            <Star className="h-4 w-4 text-gold" />
            Mark as VIP
          </label>
          <textarea
            placeholder="Arrival notes"
            className="w-full rounded-md border border-navy-600 bg-navy-900/40 px-3 py-2 text-sm"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end">
            <LegacyButton
              type="button"
              disabled={!canNext1}
              onClick={() => setStep(2)}
            >
              Next
            </LegacyButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Room type: {res.roomType?.name}
            {res.room && (
              <span className="ml-2 text-slate-200">
                Current: {res.room.number} (fl {res.room.floor})
              </span>
            )}
          </p>
          {rooms.length === 0 ? (
            <p className="text-sm text-rose-300">
              No rooms available for this type — try another type or
              override in reservations.
            </p>
          ) : (
            <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                  className={clsx(
                    "rounded-md border p-2 text-left text-sm transition",
                    selectedRoomId === room.id
                      ? "border-teal bg-teal/10"
                      : "border-navy-600 hover:border-navy-500",
                  )}
                >
                  <p className="font-medium text-slate-100">{room.number}</p>
                  <p className="text-xs text-slate-500">Fl {room.floor}</p>
                  <span className="text-xs text-slate-400">{room.status}</span>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between">
            <LegacyButton variant="ghost" type="button" onClick={() => setStep(1)}>
              Back
            </LegacyButton>
            <LegacyButton type="button" onClick={() => setStep(3)}>
              Next
            </LegacyButton>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-navy-600 bg-navy-900/30 p-3 text-sm">
            <p>
              {g?.firstName} {g?.lastName} — room{" "}
              {selectedRoomId
                ? rooms.find((r) => r.id === selectedRoomId)?.number
                : res.room?.number}
            </p>
            <p className="text-slate-400">Est. total {formatCurrency(est)}</p>
            <p className="text-slate-400">
              {nights} night{nights > 1 ? "s" : ""} @ {formatCurrency(rate)}
            </p>
            <div className="mt-2">
              <p className="text-xs text-slate-500">Payment method</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {PAY.map((p) => (
                  <label
                    key={p}
                    className={clsx(
                      "cursor-pointer rounded border px-2 py-1 text-xs",
                      payment === p
                        ? "border-teal text-teal-light"
                        : "border-navy-600",
                    )}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name="pm"
                      checked={payment === p}
                      onChange={() => setPayment(p)}
                    />
                    {p.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-teal-light" />
            <label className="text-sm">Keys to issue</label>
            <input
              type="number"
              min={1}
              max={4}
              className="w-16 rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
              value={keys}
              onChange={(e) => setKeys(Number(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={regSigned}
              onChange={(e) => setRegSigned(e.target.checked)}
            />
            Guest signed registration card
          </label>
          <div className="flex justify-between">
            <LegacyButton variant="ghost" type="button" onClick={() => setStep(2)}>
              Back
            </LegacyButton>
            <LegacyButton
              type="button"
              loading={checkInM.isPending || assignM.isPending || noteM.isPending}
              disabled={!regSigned}
              onClick={complete}
            >
              Complete check-in
            </LegacyButton>
          </div>
        </div>
      )}
    </Modal>
  );
}
