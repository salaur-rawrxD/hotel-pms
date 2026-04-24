import { prisma } from "../utils/prisma.js";

// ───────────────────────────────── helpers ─────────────────────────────────

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function todayRange() {
  return { gte: startOfDay(), lte: endOfDay() };
}

function propertyScope(req) {
  return req.user?.propertyId ?? null;
}

function roomPropertyFilter(propertyId) {
  if (!propertyId) return {};
  return { roomType: { propertyId } };
}

const VALID_TASK_STATUSES = ["PENDING", "IN_PROGRESS", "INSPECTED", "DONE"];
const VALID_TASK_TYPES = ["CHECKOUT", "STAY_OVER", "DEEP_CLEAN"];
const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
const URGENCY_ORDER = { URGENT: 0, NORMAL: 1 };

function httpErr(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function summarizeChecklist(checklist) {
  if (!checklist) return null;
  const total = checklist.items?.length ?? 0;
  const checked = checklist.items?.filter((i) => i.isChecked).length ?? 0;
  return {
    id: checklist.id,
    totalItems: total,
    checkedItems: checked,
    completionPercent: total === 0 ? 0 : Math.round((checked / total) * 100),
  };
}

// ───────────────────────── assignments ──────────────────────────────────

export async function getAssignments(req, res) {
  const propertyId = propertyScope(req);

  // Today's tasks (createdAt today OR not yet completed).
  const tasks = await prisma.housekeepingTask.findMany({
    where: {
      ...(propertyId ? { room: { ...roomPropertyFilter(propertyId) } } : {}),
      OR: [
        { createdAt: todayRange() },
        { status: { in: ["PENDING", "IN_PROGRESS", "INSPECTED"] } },
      ],
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    include: {
      room: {
        select: {
          id: true,
          number: true,
          floor: true,
          status: true,
          roomType: { select: { name: true } },
        },
      },
      assignedTo: { select: { id: true, name: true, role: true } },
      checklist: { include: { items: true } },
    },
  });

  // For each task, look up current in-house guest from reservations (same day).
  const roomIds = tasks.map((t) => t.roomId);
  const activeReservations = roomIds.length
    ? await prisma.reservation.findMany({
        where: {
          roomId: { in: roomIds },
          status: { in: ["CHECKED_IN", "CONFIRMED"] },
          checkOut: { gte: startOfDay() },
        },
        include: { guest: { select: { firstName: true, lastName: true } } },
      })
    : [];
  const resByRoom = new Map();
  for (const r of activeReservations) {
    if (!resByRoom.has(r.roomId)) resByRoom.set(r.roomId, r);
  }

  const byStaff = new Map();
  for (const t of tasks) {
    const staffId = t.assignedToId ?? "__unassigned__";
    if (!byStaff.has(staffId)) {
      byStaff.set(staffId, {
        staffId: t.assignedToId,
        staffName: t.assignedTo?.name ?? "Unassigned",
        role: t.assignedTo?.role ?? null,
        tasks: [],
        stats: { total: 0, done: 0, inProgress: 0, pending: 0, inspected: 0 },
      });
    }
    const entry = byStaff.get(staffId);
    const res = resByRoom.get(t.roomId);
    const guestName = res
      ? `${res.guest?.firstName ?? ""} ${res.guest?.lastName ?? ""}`.trim()
      : null;

    entry.tasks.push({
      id: t.id,
      roomId: t.roomId,
      roomNumber: t.room?.number,
      floor: t.room?.floor,
      roomStatus: t.room?.status,
      roomType: t.room?.roomType?.name ?? null,
      taskType: t.taskType,
      status: t.status,
      priority: t.priority,
      startedAt: t.startedAt,
      completedAt: t.completedAt,
      checkIn: res?.checkIn ?? null,
      checkOut: res?.checkOut ?? null,
      guestName,
      specialRequests: res?.specialRequests ?? null,
      checklist: summarizeChecklist(t.checklist),
    });
    entry.stats.total += 1;
    if (t.status === "DONE") entry.stats.done += 1;
    else if (t.status === "IN_PROGRESS") entry.stats.inProgress += 1;
    else if (t.status === "INSPECTED") entry.stats.inspected += 1;
    else entry.stats.pending += 1;
  }

  // Unassigned = all DIRTY rooms not already covered by a task in our list today.
  const taskRoomIds = new Set(tasks.map((t) => t.roomId));
  const dirtyRooms = await prisma.room.findMany({
    where: { ...roomPropertyFilter(propertyId), status: "DIRTY" },
    include: { roomType: { select: { name: true } } },
  });
  const unassignedRooms = dirtyRooms
    .filter((r) => !taskRoomIds.has(r.id))
    .map((r) => ({
      id: r.id,
      number: r.number,
      floor: r.floor,
      roomType: r.roomType?.name ?? null,
      status: r.status,
    }));

  const assignments = [...byStaff.values()]
    .filter((e) => e.staffId) // real staff only
    .sort((a, b) => (a.staffName || "").localeCompare(b.staffName || ""));
  const unassignedGroup = byStaff.get("__unassigned__");

  res.json({
    assignments,
    unassigned: {
      tasks: unassignedGroup?.tasks ?? [],
      rooms: unassignedRooms,
    },
  });
}

// ───────────────────────── floor map ─────────────────────────────────────

export async function getFloorMap(req, res) {
  const propertyId = propertyScope(req);

  const rooms = await prisma.room.findMany({
    where: roomPropertyFilter(propertyId),
    orderBy: [{ floor: "asc" }, { number: "asc" }],
    include: {
      roomType: { select: { name: true } },
      housekeepingTasks: {
        where: { status: { in: ["PENDING", "IN_PROGRESS", "INSPECTED"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          assignedTo: { select: { id: true, name: true } },
          checklist: { include: { items: true } },
        },
      },
    },
  });

  const occupiedIds = rooms
    .filter((r) => r.status === "OCCUPIED" || r.status === "DUE_OUT")
    .map((r) => r.id);
  const activeRes = occupiedIds.length
    ? await prisma.reservation.findMany({
        where: { roomId: { in: occupiedIds }, status: "CHECKED_IN" },
        include: { guest: { select: { firstName: true, lastName: true } } },
      })
    : [];
  const resByRoom = new Map(activeRes.map((r) => [r.roomId, r]));

  const floors = new Map();
  for (const room of rooms) {
    const currentTask = room.housekeepingTasks[0] ?? null;
    const res = resByRoom.get(room.id);
    const guestName = res
      ? `${res.guest?.firstName ?? ""} ${res.guest?.lastName ?? ""}`.trim()
      : null;

    const entry = floors.get(room.floor) ?? { floor: room.floor, rooms: [] };
    entry.rooms.push({
      id: room.id,
      number: room.number,
      floor: room.floor,
      status: room.status,
      roomType: room.roomType?.name ?? null,
      currentTask: currentTask
        ? {
            id: currentTask.id,
            status: currentTask.status,
            taskType: currentTask.taskType,
            assignedToId: currentTask.assignedToId,
            assignedTo: currentTask.assignedTo?.name ?? null,
            completionPercent:
              summarizeChecklist(currentTask.checklist)?.completionPercent ?? 0,
          }
        : null,
      currentGuest: guestName
        ? { name: guestName, checkOut: res.checkOut }
        : null,
    });
    floors.set(room.floor, entry);
  }

  res.json([...floors.values()].sort((a, b) => a.floor - b.floor));
}

// ─────────────────────── inspection queue ───────────────────────────────

export async function getInspectionQueue(req, res) {
  const propertyId = propertyScope(req);

  const tasks = await prisma.housekeepingTask.findMany({
    where: {
      status: "INSPECTED",
      ...(propertyId ? { room: { ...roomPropertyFilter(propertyId) } } : {}),
    },
    orderBy: { startedAt: "asc" },
    include: {
      room: {
        select: {
          id: true,
          number: true,
          floor: true,
          roomType: { select: { name: true } },
        },
      },
      assignedTo: { select: { id: true, name: true } },
      checklist: { include: { items: true } },
    },
  });

  res.json(
    tasks.map((t) => ({
      id: t.id,
      roomId: t.roomId,
      roomNumber: t.room?.number,
      floor: t.room?.floor,
      roomType: t.room?.roomType?.name ?? null,
      assignedToId: t.assignedToId,
      assignedTo: t.assignedTo?.name ?? null,
      notes: t.notes,
      completedAt: t.completedAt,
      startedAt: t.startedAt,
      checklist: summarizeChecklist(t.checklist),
    })),
  );
}

// ───────────────────────── task + checklist ─────────────────────────────

export async function getTaskChecklist(req, res) {
  const { id } = req.params;
  const task = await prisma.housekeepingTask.findUnique({
    where: { id },
    include: {
      room: {
        select: {
          id: true,
          number: true,
          floor: true,
          status: true,
          roomType: { select: { name: true } },
        },
      },
      assignedTo: { select: { id: true, name: true, role: true } },
      checklist: {
        include: {
          items: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!task) throw httpErr(404, "Task not found");

  // Attach current in-house reservation if any.
  const reservation = await prisma.reservation.findFirst({
    where: {
      roomId: task.roomId,
      status: { in: ["CHECKED_IN", "CONFIRMED"] },
      checkOut: { gte: startOfDay() },
    },
    include: { guest: true },
  });

  // Group checklist items by category preserving order.
  const grouped = new Map();
  for (const it of task.checklist?.items ?? []) {
    if (!grouped.has(it.category)) grouped.set(it.category, []);
    grouped.get(it.category).push({
      id: it.id,
      label: it.label,
      category: it.category,
      order: it.order,
      isChecked: it.isChecked,
      checkedAt: it.checkedAt,
    });
  }

  const summary = summarizeChecklist(task.checklist);

  res.json({
    task: {
      id: task.id,
      roomId: task.roomId,
      roomNumber: task.room?.number,
      floor: task.room?.floor,
      roomType: task.room?.roomType?.name ?? null,
      roomStatus: task.room?.status,
      taskType: task.taskType,
      status: task.status,
      priority: task.priority,
      notes: task.notes,
      startedAt: task.startedAt,
      completedAt: task.completedAt,
      assignedTo: task.assignedTo
        ? { id: task.assignedTo.id, name: task.assignedTo.name, role: task.assignedTo.role }
        : null,
    },
    checklist: summary
      ? {
          ...summary,
          byCategory: [...grouped.entries()].map(([category, items]) => ({
            category,
            items,
          })),
        }
      : null,
    reservation: reservation
      ? {
          id: reservation.id,
          guestName:
            `${reservation.guest?.firstName ?? ""} ${reservation.guest?.lastName ?? ""}`.trim(),
          adults: reservation.adults,
          children: reservation.children,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          specialRequests: reservation.specialRequests,
        }
      : null,
  });
}

export async function updateChecklistItem(req, res) {
  const { checklistId, itemId } = req.params;

  const item = await prisma.roomChecklistItem.findUnique({ where: { id: itemId } });
  if (!item || item.checklistId !== checklistId) {
    throw httpErr(404, "Checklist item not found");
  }

  const nextChecked = !item.isChecked;
  const updated = await prisma.roomChecklistItem.update({
    where: { id: itemId },
    data: {
      isChecked: nextChecked,
      checkedAt: nextChecked ? new Date() : null,
    },
  });

  const all = await prisma.roomChecklistItem.findMany({
    where: { checklistId },
  });
  const total = all.length;
  const checked = all.filter((i) => i.isChecked).length;
  const completionPercent = total === 0 ? 0 : Math.round((checked / total) * 100);

  res.json({
    item: updated,
    summary: { totalItems: total, checkedItems: checked, completionPercent },
  });
}

export async function updateTaskStatus(req, res) {
  const { id } = req.params;
  const { status: nextStatus, notes } = req.body ?? {};

  if (!nextStatus || !VALID_TASK_STATUSES.includes(nextStatus)) {
    throw httpErr(400, "Invalid status");
  }

  const task = await prisma.housekeepingTask.findUnique({
    where: { id },
    include: { room: true },
  });
  if (!task) throw httpErr(404, "Task not found");

  // Manager/admin required to approve final inspection (INSPECTED → DONE).
  if (task.status === "INSPECTED" && nextStatus === "DONE") {
    if (!["ADMIN", "MANAGER"].includes(req.user?.role)) {
      throw httpErr(403, "Only managers or admins can approve inspections");
    }
  }

  // Valid transitions:
  //   PENDING → IN_PROGRESS
  //   IN_PROGRESS → INSPECTED
  //   INSPECTED → DONE
  //   any → PENDING (reset)
  const allowed = {
    PENDING: ["IN_PROGRESS", "PENDING"],
    IN_PROGRESS: ["INSPECTED", "PENDING"],
    INSPECTED: ["DONE", "PENDING"],
    DONE: ["PENDING"],
  };
  if (!allowed[task.status]?.includes(nextStatus)) {
    throw httpErr(400, `Cannot transition from ${task.status} to ${nextStatus}`);
  }

  const data = { status: nextStatus };
  if (notes !== undefined) data.notes = notes;
  if (nextStatus === "IN_PROGRESS" && !task.startedAt) data.startedAt = new Date();
  if (nextStatus === "DONE") data.completedAt = new Date();
  if (nextStatus === "PENDING") {
    data.startedAt = null;
    data.completedAt = null;
  }

  const updated = await prisma.housekeepingTask.update({
    where: { id },
    data,
    include: {
      room: true,
      assignedTo: { select: { id: true, name: true } },
      checklist: { include: { items: true } },
    },
  });

  // Mirror on room status.
  let newRoomStatus = null;
  if (nextStatus === "IN_PROGRESS") newRoomStatus = "DIRTY";
  else if (nextStatus === "INSPECTED") newRoomStatus = "DIRTY"; // awaiting approval → still dirty operationally
  else if (nextStatus === "DONE") newRoomStatus = "CLEAN";
  else if (nextStatus === "PENDING") newRoomStatus = "DIRTY";

  if (newRoomStatus && task.room.status !== "OCCUPIED" && task.room.status !== "OUT_OF_ORDER") {
    await prisma.room.update({
      where: { id: task.roomId },
      data: { status: newRoomStatus },
    });
  }

  // If now INSPECTED and checklist exists, mark completed.
  if (nextStatus === "INSPECTED" && updated.checklist) {
    await prisma.roomChecklist.update({
      where: { id: updated.checklist.id },
      data: { completedAt: new Date() },
    });
  }
  if (nextStatus === "DONE" && updated.checklist) {
    await prisma.roomChecklist.update({
      where: { id: updated.checklist.id },
      data: {
        inspectedById: req.user?.userId ?? null,
        inspectedAt: new Date(),
      },
    });
  }

  res.json({ ...updated, checklist: summarizeChecklist(updated.checklist) });
}

export async function assignTask(req, res) {
  const { roomId, staffId, taskType = "CHECKOUT", priority, notes } = req.body ?? {};
  if (!roomId) throw httpErr(400, "roomId is required");
  if (!VALID_TASK_TYPES.includes(taskType)) throw httpErr(400, "Invalid taskType");

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw httpErr(404, "Room not found");

  const propertyId = propertyScope(req);
  const template = await prisma.checklistTemplate.findFirst({
    where: {
      taskType,
      ...(propertyId ? { propertyId } : {}),
    },
    include: { items: { orderBy: { order: "asc" } } },
  });

  const task = await prisma.housekeepingTask.create({
    data: {
      roomId,
      assignedToId: staffId ?? null,
      taskType,
      priority: priority ?? 3,
      notes: notes ?? null,
      status: "PENDING",
      checklist: template
        ? {
            create: {
              items: {
                create: template.items.map((it, idx) => ({
                  label: it.label,
                  category: it.category,
                  order: idx,
                })),
              },
            },
          }
        : undefined,
    },
    include: {
      room: true,
      assignedTo: { select: { id: true, name: true } },
      checklist: { include: { items: true } },
    },
  });

  // Mirror — if room was VACANT / CLEAN, flip to DIRTY because work is queued.
  if (["VACANT", "CLEAN"].includes(room.status)) {
    await prisma.room.update({ where: { id: roomId }, data: { status: "DIRTY" } });
  }

  res.status(201).json({ ...task, checklist: summarizeChecklist(task.checklist) });
}

export async function patchTaskAssignment(req, res) {
  const { id } = req.params;
  const { staffId } = req.body ?? {};
  if (!staffId) throw httpErr(400, "staffId is required");

  const task = await prisma.housekeepingTask.findUnique({
    where: { id },
    include: {
      room: true,
      assignedTo: { select: { id: true, name: true } },
      checklist: { include: { items: true } },
    },
  });
  if (!task) throw httpErr(404, "Task not found");

  const propertyId = propertyScope(req);
  if (propertyId) {
    const inScope = await prisma.room.findFirst({
      where: { id: task.roomId, ...roomPropertyFilter(propertyId) },
      select: { id: true },
    });
    if (!inScope) throw httpErr(403, "Task is outside your property");
  }

  const staff = await prisma.user.findUnique({ where: { id: staffId } });
  if (!staff) throw httpErr(404, "Staff member not found");
  if (staff.role !== "HOUSEKEEPING") {
    throw httpErr(400, "Only housekeeping staff can be assigned to tasks");
  }

  const updated = await prisma.housekeepingTask.update({
    where: { id },
    data: { assignedToId: staffId },
    include: {
      room: true,
      assignedTo: { select: { id: true, name: true } },
      checklist: { include: { items: true } },
    },
  });

  res.json({ ...updated, checklist: summarizeChecklist(updated.checklist) });
}

// ───────────────────────── lost & found ────────────────────────────────

export async function getLostAndFound(_req, res) {
  const items = await prisma.lostAndFound.findMany({
    orderBy: { foundAt: "desc" },
    include: { room: { select: { id: true, number: true, floor: true } } },
  });
  res.json(
    items.map((i) => ({
      id: i.id,
      roomId: i.roomId,
      roomNumber: i.room?.number,
      floor: i.room?.floor,
      description: i.description,
      foundBy: i.foundBy,
      foundAt: i.foundAt,
      status: i.status,
      guestName: i.guestName,
      claimedAt: i.claimedAt,
      notes: i.notes,
    })),
  );
}

export async function createLostAndFound(req, res) {
  const { roomId, description, foundBy, foundAt, guestName, notes } = req.body ?? {};
  if (!roomId || !description || !foundBy) {
    throw httpErr(400, "roomId, description, and foundBy are required");
  }
  const created = await prisma.lostAndFound.create({
    data: {
      roomId,
      description,
      foundBy,
      foundAt: foundAt ? new Date(foundAt) : new Date(),
      guestName: guestName ?? null,
      notes: notes ?? null,
    },
    include: { room: { select: { number: true, floor: true } } },
  });
  res.status(201).json(created);
}

export async function updateLostAndFound(req, res) {
  const { id } = req.params;
  const { status, guestName, notes } = req.body ?? {};
  if (status && !["UNCLAIMED", "CLAIMED", "RETURNED", "DONATED"].includes(status)) {
    throw httpErr(400, "Invalid status");
  }

  const data = {};
  if (status) data.status = status;
  if (guestName !== undefined) data.guestName = guestName;
  if (notes !== undefined) data.notes = notes;
  if (status === "CLAIMED" || status === "RETURNED") {
    data.claimedAt = new Date();
  }

  const updated = await prisma.lostAndFound.update({ where: { id }, data });
  res.json(updated);
}

// ───────────────────────── maintenance ─────────────────────────────────

export async function getMaintenanceRequests(_req, res) {
  const reqs = await prisma.maintenanceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      room: { select: { id: true, number: true, floor: true } },
      reporter: { select: { id: true, name: true } },
    },
  });
  const serialized = reqs.map((r) => ({
    id: r.id,
    roomId: r.roomId,
    roomNumber: r.room?.number,
    floor: r.room?.floor,
    description: r.description,
    severity: r.severity,
    status: r.status,
    reportedBy: r.reportedBy || r.reporter?.name || "",
    reportedById: r.reportedById,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt,
    resolvedBy: r.resolvedBy,
  }));
  // Custom sort: severity first, then createdAt desc.
  serialized.sort((a, b) => {
    const s = (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (s !== 0) return s;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.json(serialized);
}

export async function createMaintenanceRequest(req, res) {
  const { roomId, description, severity = "LOW", reportedBy } = req.body ?? {};
  if (!roomId || !description) throw httpErr(400, "roomId and description are required");
  if (!["LOW", "MEDIUM", "HIGH"].includes(severity)) {
    throw httpErr(400, "Invalid severity");
  }

  const created = await prisma.maintenanceRequest.create({
    data: {
      roomId,
      description,
      severity,
      reportedById: req.user.userId,
      reportedBy: reportedBy ?? req.user.name ?? "",
      status: "OPEN",
    },
    include: {
      room: { select: { number: true, floor: true } },
    },
  });
  res.status(201).json(created);
}

export async function updateMaintenanceRequest(req, res) {
  const { id } = req.params;
  const { status, description, severity, resolutionNotes } = req.body ?? {};

  const existing = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!existing) throw httpErr(404, "Maintenance request not found");

  const data = {};
  if (status) {
    if (!["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      throw httpErr(400, "Invalid status");
    }
    data.status = status;
    if (status === "RESOLVED" || status === "CLOSED") {
      data.resolvedAt = new Date();
      data.resolvedBy = req.user?.name ?? req.user?.userId ?? null;
    }
  }
  if (description !== undefined) data.description = description;
  if (severity !== undefined) {
    if (!["LOW", "MEDIUM", "HIGH"].includes(severity)) throw httpErr(400, "Invalid severity");
    data.severity = severity;
  }
  if (resolutionNotes !== undefined) {
    data.description = `${existing.description}\n\nResolution: ${resolutionNotes}`;
  }

  const updated = await prisma.maintenanceRequest.update({ where: { id }, data });
  res.json(updated);
}

// ───────────────────────── supplies ────────────────────────────────────

export async function getSupplyRequests(_req, res) {
  const reqs = await prisma.supplyRequest.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  reqs.sort((a, b) => {
    const u = (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9);
    if (u !== 0) return u;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.json(reqs);
}

export async function createSupplyRequest(req, res) {
  const { items, quantity, urgency = "NORMAL", notes, requestedBy } = req.body ?? {};
  if (!items || !quantity) throw httpErr(400, "items and quantity are required");
  if (!["NORMAL", "URGENT"].includes(urgency)) throw httpErr(400, "Invalid urgency");

  const created = await prisma.supplyRequest.create({
    data: {
      items,
      quantity: String(quantity),
      urgency,
      notes: notes ?? null,
      requestedBy: requestedBy ?? req.user?.name ?? "",
      status: "PENDING",
    },
  });
  res.status(201).json(created);
}

export async function updateSupplyRequest(req, res) {
  const { id } = req.params;
  const { status } = req.body ?? {};
  if (!["PENDING", "FULFILLED"].includes(status)) throw httpErr(400, "Invalid status");

  const data = { status };
  if (status === "FULFILLED") data.fulfilledAt = new Date();

  const updated = await prisma.supplyRequest.update({ where: { id }, data });
  res.json(updated);
}
