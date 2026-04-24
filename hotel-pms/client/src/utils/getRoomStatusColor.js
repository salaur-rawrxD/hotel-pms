import { ROOM_STATUSES } from "../constants/roomStatuses.js";

const STATUS_COLORS = {
  [ROOM_STATUSES.VACANT]:       "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  [ROOM_STATUSES.CLEAN]:        "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  [ROOM_STATUSES.OCCUPIED]:     "bg-sky-500/15 text-sky-300 border-sky-500/40",
  [ROOM_STATUSES.DIRTY]:        "bg-amber-500/15 text-amber-300 border-amber-500/40",
  [ROOM_STATUSES.DUE_IN]:       "bg-indigo-500/15 text-indigo-300 border-indigo-500/40",
  [ROOM_STATUSES.DUE_OUT]:      "bg-orange-500/15 text-orange-300 border-orange-500/40",
  [ROOM_STATUSES.OUT_OF_ORDER]: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

export function getRoomStatusColor(status) {
  return STATUS_COLORS[status] ?? "bg-slate-500/15 text-slate-300 border-slate-500/40";
}
