import { prisma } from "../utils/prisma.js";

// ──────────────────────────────────────────────────────────────
// Date helpers — operate in server local time, which is fine for
// a single-property demo. For multi-tz deployments, scope to the
// property's IANA timezone.
// ──────────────────────────────────────────────────────────────
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

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfMonth(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Format like "Apr 10" — kept dependency-free to match MMM DD spec.
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function formatMonthDay(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function toNum(value) {
  if (value === null || value === undefined) return 0;
  // Prisma returns Decimal instances — coerce safely.
  const n = typeof value === "object" && "toNumber" in value
    ? value.toNumber()
    : Number(value);
  return Number.isFinite(n) ? n : 0;
}

const REVENUE_TYPES = ["ROOM", "FOOD", "BEVERAGE", "PARKING", "OTHER"];

// Resolve the property scope for the authenticated user. Admins without
// a propertyId see data across all properties (fine for single-property demo).
function propertyScope(req) {
  const propertyId = req.user?.propertyId ?? null;
  return propertyId;
}

function roomPropertyFilter(propertyId) {
  if (!propertyId) return {};
  return { roomType: { propertyId } };
}

function reservationPropertyFilter(propertyId) {
  if (!propertyId) return {};
  return { room: { roomType: { propertyId } } };
}

function folioPropertyFilter(propertyId) {
  if (!propertyId) return {};
  return { reservation: { room: { roomType: { propertyId } } } };
}

// ──────────────────────────────────────────────────────────────
// GET /api/dashboard/summary
// ──────────────────────────────────────────────────────────────
export async function getSummary(req, res) {
  const propertyId = propertyScope(req);
  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const monthStart = startOfMonth();

  const [
    totalRooms,
    occupiedRooms,
    arrivalsToday,
    departuresToday,
    inHouseCount,
    walkInsToday,
    todayRevenueAgg,
    yesterdayRevenueAgg,
    monthRevenueAgg,
  ] = await Promise.all([
    prisma.room.count({ where: roomPropertyFilter(propertyId) }),
    prisma.room.count({
      where: { ...roomPropertyFilter(propertyId), status: "OCCUPIED" },
    }),
    prisma.reservation.count({
      where: {
        ...reservationPropertyFilter(propertyId),
        checkIn: { gte: today, lt: tomorrow },
        status: "CONFIRMED",
      },
    }),
    prisma.reservation.count({
      where: {
        ...reservationPropertyFilter(propertyId),
        checkOut: { gte: today, lt: tomorrow },
        status: "CHECKED_IN",
      },
    }),
    prisma.reservation.count({
      where: {
        ...reservationPropertyFilter(propertyId),
        status: "CHECKED_IN",
      },
    }),
    prisma.reservation.count({
      where: {
        ...reservationPropertyFilter(propertyId),
        checkIn: { gte: today, lt: tomorrow },
        source: "WALKIN",
      },
    }),
    prisma.folioItem.aggregate({
      _sum: { amount: true },
      where: {
        ...folioPropertyFilter(propertyId),
        type: { in: REVENUE_TYPES },
        postedAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.folioItem.aggregate({
      _sum: { amount: true },
      where: {
        ...folioPropertyFilter(propertyId),
        type: { in: REVENUE_TYPES },
        postedAt: { gte: yesterday, lt: today },
      },
    }),
    prisma.folioItem.aggregate({
      _sum: { amount: true },
      where: {
        ...folioPropertyFilter(propertyId),
        type: { in: REVENUE_TYPES },
        postedAt: { gte: monthStart, lt: tomorrow },
      },
    }),
  ]);

  const todayRevenue = toNum(todayRevenueAgg._sum.amount);
  const yesterdayRevenue = toNum(yesterdayRevenueAgg._sum.amount);
  const monthRevenue = toNum(monthRevenueAgg._sum.amount);

  const occupancyPercent =
    totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0.0";

  const adr = occupiedRooms > 0 ? todayRevenue / occupiedRooms : 0;
  const revpar = totalRooms > 0 ? todayRevenue / totalRooms : 0;

  res.json({
    occupancy: {
      totalRooms,
      occupiedRooms,
      occupancyPercent,
    },
    revenue: {
      todayRevenue,
      yesterdayRevenue,
      monthRevenue,
    },
    traffic: {
      arrivalsToday,
      departuresToday,
      inHouseCount,
      walkInsToday,
    },
    adr: { value: Number(adr.toFixed(2)) },
    revpar: { value: Number(revpar.toFixed(2)) },
  });
}

// ──────────────────────────────────────────────────────────────
// GET /api/dashboard/revenue-chart
// ──────────────────────────────────────────────────────────────
export async function getRevenueChart(req, res) {
  const propertyId = propertyScope(req);
  const today = startOfDay();
  const start = addDays(today, -13);
  const end = addDays(today, 1);

  const items = await prisma.folioItem.findMany({
    where: {
      ...folioPropertyFilter(propertyId),
      type: { in: REVENUE_TYPES },
      postedAt: { gte: start, lt: end },
    },
    select: { amount: true, postedAt: true },
  });

  // Bucket by YYYY-MM-DD in server local time.
  const buckets = new Map();
  for (let i = 0; i < 14; i += 1) {
    const day = addDays(start, i);
    const key = day.toISOString().slice(0, 10);
    buckets.set(key, { date: formatMonthDay(day), revenue: 0 });
  }

  for (const it of items) {
    const key = startOfDay(it.postedAt).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) bucket.revenue += toNum(it.amount);
  }

  res.json([...buckets.values()]);
}

// ──────────────────────────────────────────────────────────────
// Arrivals / Departures — shared serializer
// ──────────────────────────────────────────────────────────────
function serializeReservation(r) {
  const nights = Math.max(
    1,
    Math.round(
      (startOfDay(r.checkOut).getTime() - startOfDay(r.checkIn).getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );
  const firstName = r.guest?.firstName ?? "";
  const lastName = r.guest?.lastName ?? "";
  return {
    id: r.id,
    confirmationNumber: r.confirmationNumber,
    guestName: `${firstName} ${lastName}`.trim(),
    guestLastName: lastName,
    roomNumber: r.room?.number ?? null,
    roomTypeName: r.room?.roomType?.name ?? null,
    adults: r.adults,
    children: r.children,
    source: r.source,
    specialRequests: r.specialRequests ?? null,
    status: r.status,
    depositPaid: toNum(r.depositPaid),
    totalAmount: toNum(r.totalAmount),
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    nights,
  };
}

async function fetchReservationsForToday(propertyId, field, extraWhere = {}) {
  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const rows = await prisma.reservation.findMany({
    where: {
      ...reservationPropertyFilter(propertyId),
      [field]: { gte: today, lt: tomorrow },
      ...extraWhere,
    },
    include: {
      guest: { select: { firstName: true, lastName: true } },
      room: {
        select: {
          number: true,
          floor: true,
          roomType: { select: { name: true } },
        },
      },
    },
  });
  return rows
    .map(serializeReservation)
    .sort((a, b) =>
      (a.guestLastName || "").localeCompare(b.guestLastName || ""),
    );
}

export async function getArrivalsToday(req, res) {
  const propertyId = propertyScope(req);
  const rows = await fetchReservationsForToday(propertyId, "checkIn");
  res.json(rows);
}

export async function getDeparturesToday(req, res) {
  const propertyId = propertyScope(req);
  const rows = await fetchReservationsForToday(propertyId, "checkOut", {
    status: "CHECKED_IN",
  });
  res.json(rows);
}

// ──────────────────────────────────────────────────────────────
// GET /api/dashboard/alerts
// ──────────────────────────────────────────────────────────────
const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

export async function getAlerts(req, res) {
  const propertyId = propertyScope(req);
  const today = startOfDay();
  const tomorrow = addDays(today, 1);

  const [overdue, unassigned, dirtyRooms, unpaidCheckedIn, outOfOrder] =
    await Promise.all([
      prisma.reservation.findMany({
        where: {
          ...reservationPropertyFilter(propertyId),
          status: "CHECKED_IN",
          checkOut: { lt: today },
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
          room: { select: { number: true } },
        },
      }),
      prisma.reservation.findMany({
        where: {
          // `roomId is null` — so we cannot use reservationPropertyFilter
          // (which relies on room → roomType → propertyId). Scope by
          // ratePlanId / fallback: include all unassigned arrivals since
          // a property boundary on unassigned is meaningless until assigned.
          status: "CONFIRMED",
          checkIn: { gte: today, lt: tomorrow },
          roomId: null,
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.room.findMany({
        where: { ...roomPropertyFilter(propertyId), status: "DIRTY" },
        select: { id: true, number: true },
      }),
      prisma.reservation.findMany({
        where: {
          ...reservationPropertyFilter(propertyId),
          status: "CHECKED_IN",
          depositPaid: 0,
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
          room: { select: { number: true } },
        },
      }),
      prisma.room.findMany({
        where: { ...roomPropertyFilter(propertyId), status: "OUT_OF_ORDER" },
        select: { id: true, number: true },
      }),
    ]);

  const alerts = [];

  for (const r of overdue) {
    const name = `${r.guest?.firstName ?? ""} ${r.guest?.lastName ?? ""}`.trim();
    alerts.push({
      id: `overdue-${r.id}`,
      severity: "high",
      category: "overdue_checkout",
      message: `${name} — Room ${r.room?.number ?? "—"} overdue checkout`,
      createdAt: r.checkOut,
    });
  }

  for (const r of unassigned) {
    const name = `${r.guest?.firstName ?? ""} ${r.guest?.lastName ?? ""}`.trim();
    alerts.push({
      id: `unassigned-${r.id}`,
      severity: "high",
      category: "unassigned_arrival",
      message: `${name} arriving today — no room assigned`,
      createdAt: r.checkIn,
    });
  }

  for (const room of dirtyRooms) {
    alerts.push({
      id: `dirty-${room.id}`,
      severity: "medium",
      category: "dirty_room",
      message: `Room ${room.number} needs housekeeping`,
      createdAt: new Date(),
    });
  }

  for (const r of unpaidCheckedIn) {
    const name = `${r.guest?.firstName ?? ""} ${r.guest?.lastName ?? ""}`.trim();
    alerts.push({
      id: `unpaid-${r.id}`,
      severity: "medium",
      category: "unpaid_balance",
      message: `${name} — Room ${r.room?.number ?? "—"} — payment pending`,
      createdAt: r.checkIn,
    });
  }

  for (const room of outOfOrder) {
    alerts.push({
      id: `ooo-${room.id}`,
      severity: "low",
      category: "out_of_order",
      message: `Room ${room.number} is out of order`,
      createdAt: new Date(),
    });
  }

  alerts.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  res.json(alerts);
}

// ──────────────────────────────────────────────────────────────
// GET /api/dashboard/room-grid
// ──────────────────────────────────────────────────────────────
export async function getRoomGrid(req, res) {
  const propertyId = propertyScope(req);

  const rooms = await prisma.room.findMany({
    where: roomPropertyFilter(propertyId),
    orderBy: [{ floor: "asc" }, { number: "asc" }],
    include: {
      roomType: { select: { name: true } },
    },
  });

  // Look up current guests for OCCUPIED / DUE_OUT rooms via CHECKED_IN reservations.
  const occupiedRoomIds = rooms
    .filter((r) => r.status === "OCCUPIED" || r.status === "DUE_OUT")
    .map((r) => r.id);

  const activeReservations = occupiedRoomIds.length
    ? await prisma.reservation.findMany({
        where: {
          status: "CHECKED_IN",
          roomId: { in: occupiedRoomIds },
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
        },
      })
    : [];
  const guestByRoom = new Map(
    activeReservations.map((r) => [
      r.roomId,
      {
        firstName: r.guest?.firstName ?? "",
        lastName: r.guest?.lastName ?? "",
        checkOut: r.checkOut,
      },
    ]),
  );

  // Also peek at DUE_IN rooms for tooltip context.
  const dueInRoomIds = rooms.filter((r) => r.status === "DUE_IN").map((r) => r.id);
  const upcomingReservations = dueInRoomIds.length
    ? await prisma.reservation.findMany({
        where: {
          status: "CONFIRMED",
          roomId: { in: dueInRoomIds },
          checkIn: {
            gte: startOfDay(),
            lt: addDays(startOfDay(), 1),
          },
        },
        include: {
          guest: { select: { firstName: true, lastName: true } },
        },
      })
    : [];
  const upcomingByRoom = new Map(
    upcomingReservations.map((r) => [
      r.roomId,
      {
        firstName: r.guest?.firstName ?? "",
        lastName: r.guest?.lastName ?? "",
        checkIn: r.checkIn,
      },
    ]),
  );

  const floors = new Map();
  for (const room of rooms) {
    const entry = floors.get(room.floor) ?? { floor: room.floor, rooms: [] };
    entry.rooms.push({
      id: room.id,
      number: room.number,
      floor: room.floor,
      status: room.status,
      roomType: { name: room.roomType?.name ?? "" },
      currentGuest: guestByRoom.get(room.id) ?? null,
      upcomingGuest: upcomingByRoom.get(room.id) ?? null,
    });
    floors.set(room.floor, entry);
  }

  const result = [...floors.values()].sort((a, b) => a.floor - b.floor);
  res.json(result);
}
