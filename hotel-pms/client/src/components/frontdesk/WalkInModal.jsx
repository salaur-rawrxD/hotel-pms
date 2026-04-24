import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import toast from "react-hot-toast";

import Modal from "../layout/Modal.jsx";
import Button from "../ui/Button.jsx";
import { roomsApi } from "../../api/rooms.js";
import { ratesApi } from "../../api/rates.js";
import { useWalkInMutation, useCheckInMutation } from "../../hooks/useFrontDesk.js";
import { formatCurrency } from "./utils.js";

export default function WalkInModal({ open, onClose, onCheckInStart }) {
  const walkInM = useWalkInMutation();
  const checkInM = useCheckInMutation();
  const { data: roomList = [] } = useQuery({
    queryKey: ["rooms", "all"],
    queryFn: () => roomsApi.list(),
    enabled: open,
  });
  const { data: ratePlans = [] } = useQuery({
    queryKey: ["rateplans"],
    queryFn: () => ratesApi.listPlans(),
    enabled: open,
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idType: "PASSPORT",
    idNumber: "",
    checkOut: "",
    roomTypeId: "",
    adults: 2,
    children: 0,
    specialRequests: "",
    roomId: null,
    ratePlanId: "",
    rate: "",
  });

  const roomTypes = useMemo(() => {
    const m = new Map();
    for (const r of roomList) {
      if (r.roomType) m.set(r.roomTypeId, r.roomType);
    }
    return [...m.values()];
  }, [roomList]);

  const availableRooms = useMemo(() => {
    if (!form.roomTypeId) return [];
    return roomList.filter(
      (r) =>
        r.roomTypeId === form.roomTypeId &&
        ["VACANT", "CLEAN", "DUE_IN"].includes(r.status),
    );
  }, [roomList, form.roomTypeId]);

  useEffect(() => {
    if (open && roomTypes[0] && !form.roomTypeId) {
      setForm((f) => ({ ...f, roomTypeId: roomTypes[0].id }));
    }
    if (open && ratePlans[0] && !form.ratePlanId) {
      setForm((f) => ({ ...f, ratePlanId: ratePlans[0].id }));
    }
  }, [open, roomTypes, ratePlans, form.roomTypeId, form.ratePlanId]);

  const selectedRt = roomTypes.find((r) => r.id === form.roomTypeId);
  const selectedPlan = ratePlans.find((r) => r.id === form.ratePlanId);
  const nights = useMemo(() => {
    if (!form.checkOut) return 1;
    const a = new Date();
    a.setHours(0, 0, 0, 0);
    const b = new Date(form.checkOut);
    if (Number.isNaN(b.getTime())) return 1;
    return Math.max(1, Math.round((b - a) / 86400000) || 1);
  }, [form.checkOut]);
  const rate = form.rate
    ? Number(form.rate)
    : selectedPlan
      ? Number(selectedPlan.baseRate)
      : selectedRt
        ? Number(selectedRt.baseRate)
        : 0;
  const est = rate * nights * 1.14;

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function createOnly() {
    try {
      const co = new Date(form.checkOut);
      if (Number.isNaN(co.getTime())) {
        toast.error("Check-out date required");
        return;
      }
      await walkInM.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        idType: form.idType,
        idNumber: form.idNumber,
        checkOut: co.toISOString(),
        roomTypeId: form.roomTypeId,
        roomId: form.roomId,
        ratePlanId: form.ratePlanId || ratePlans[0]?.id,
        rate,
        adults: form.adults,
        children: form.children,
        specialRequests: form.specialRequests,
        paymentMethod: "CREDIT_CARD",
      });
      toast.success("Walk-in created");
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  }

  async function createAndCheckIn() {
    try {
      const co = new Date(form.checkOut);
      if (Number.isNaN(co.getTime())) {
        toast.error("Check-out date required");
        return;
      }
      if (!form.roomId) {
        toast.error("Select a room to check in");
        return;
      }
      const res = await walkInM.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        idType: form.idType,
        idNumber: form.idNumber,
        checkOut: co.toISOString(),
        roomTypeId: form.roomTypeId,
        roomId: form.roomId,
        ratePlanId: form.ratePlanId || ratePlans[0]?.id,
        rate,
        adults: form.adults,
        children: form.children,
        specialRequests: form.specialRequests,
        paymentMethod: "CREDIT_CARD",
      });
      onCheckInStart?.(res);
      await checkInM.mutateAsync({
        id: res.id,
        data: {
          idVerified: true,
          paymentMethod: "CREDIT_CARD",
          keyCount: 1,
        },
      });
      toast.success("Walk-in checked in");
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Walk-in reservation"
      size="lg"
    >
      <div className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-500">First name *</label>
          <input
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Last name *</label>
          <input
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Email *</label>
          <input
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Phone *</label>
          <input
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">ID type / number</label>
          <div className="flex gap-1">
            <input
              className="w-1/3 rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
              value={form.idType}
              onChange={(e) => setField("idType", e.target.value)}
            />
            <input
              className="flex-1 rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
              value={form.idNumber}
              onChange={(e) => setField("idNumber", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Check-out *</label>
          <input
            type="date"
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={form.checkOut}
            onChange={(e) => setField("checkOut", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Room type *</label>
          <select
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={form.roomTypeId}
            onChange={(e) => {
              setField("roomTypeId", e.target.value);
              setField("roomId", null);
            }}
          >
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Adults / children</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              className="w-20 rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
              value={form.adults}
              onChange={(e) => setField("adults", Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              className="w-20 rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
              value={form.children}
              onChange={(e) => setField("children", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-xs text-slate-500">Special requests</label>
          <textarea
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            rows={2}
            value={form.specialRequests}
            onChange={(e) => setField("specialRequests", e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <p className="mb-1 text-xs text-slate-500">Available rooms</p>
          <div className="grid max-h-32 grid-cols-3 gap-1 overflow-y-auto sm:grid-cols-4">
            {availableRooms.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setField("roomId", r.id)}
                className={clsx(
                  "rounded border p-1 text-left text-xs",
                  form.roomId === r.id
                    ? "border-teal bg-teal/10"
                    : "border-navy-600",
                )}
              >
                {r.number} — {r.status}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Rate plan</label>
          <select
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={form.ratePlanId}
            onChange={(e) => setField("ratePlanId", e.target.value)}
          >
            {ratePlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Override rate / night</label>
          <input
            className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
            value={form.rate}
            placeholder={String(rate || "")}
            onChange={(e) => setField("rate", e.target.value)}
          />
        </div>
        <div className="col-span-2 text-slate-300">
          Est. {nights} night{nights > 1 ? "s" : ""}: {formatCurrency(est)}
        </div>
        <div className="col-span-2 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="gold"
            loading={walkInM.isPending || checkInM.isPending}
            onClick={createAndCheckIn}
          >
            Create &amp; check in
          </Button>
          <Button
            type="button"
            variant="ghost"
            loading={walkInM.isPending}
            onClick={createOnly}
          >
            Create only
          </Button>
        </div>
      </div>
    </Modal>
  );
}
