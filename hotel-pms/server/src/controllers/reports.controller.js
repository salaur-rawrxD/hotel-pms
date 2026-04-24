import { prisma } from "../utils/prisma.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDateParam(raw) {
  if (!raw) return new Date();
  const v = String(raw).trim().toLowerCase();
  const now = new Date();
  if (v === "today" || v === "now") return now;
  if (v === "yesterday") return new Date(now.getTime() - 86_400_000);
  if (v === "tomorrow") return new Date(now.getTime() + 86_400_000);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? now : parsed;
}

export async function dailySummary(req, res) {
  const target = parseDateParam(req.query.date);
  const start = startOfDay(target);
  const end = endOfDay(target);

  const [totalRooms, occupied, arrivals, departures, postings] = await Promise.all([
    prisma.room.count(),
    prisma.reservation.count({
      where: {
        status: "CHECKED_IN",
        checkIn: { lte: end },
        checkOut: { gt: start },
      },
    }),
    prisma.reservation.count({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { gte: start, lte: end },
      },
    }),
    prisma.reservation.count({
      where: {
        status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
        checkOut: { gte: start, lte: end },
      },
    }),
    prisma.folioItem.aggregate({
      _sum: { amount: true },
      where: { postedAt: { gte: start, lte: end } },
    }),
  ]);

  const revenue = Number(postings._sum.amount ?? 0);

  res.json({
    date: start.toISOString(),
    totalRooms,
    occupied,
    occupancy: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
    occupancyPct: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
    revenue,
    arrivals,
    departures,
  });
}

export async function occupancy(req, res) {
  res.json({
    startDate: req.query.startDate ?? null,
    endDate: req.query.endDate ?? null,
    data: [],
    message: "Occupancy report aggregation not yet implemented.",
  });
}

export async function revenue(req, res) {
  res.json({
    startDate: req.query.startDate ?? null,
    endDate: req.query.endDate ?? null,
    data: [],
    message: "Revenue report aggregation not yet implemented.",
  });
}

export async function arrivalsDepartures(req, res) {
  const target = parseDateParam(req.query.date);
  const start = startOfDay(target);
  const end = endOfDay(target);

  const [arrivals, departures] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkIn: { gte: start, lte: end },
      },
      include: {
        guest: true,
        room: { select: { number: true } },
        roomType: { select: { name: true } },
      },
    }),
    prisma.reservation.findMany({
      where: {
        status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
        checkOut: { gte: start, lte: end },
      },
      include: {
        guest: true,
        room: { select: { number: true } },
        roomType: { select: { name: true } },
      },
    }),
  ]);

  res.json({ date: start.toISOString(), arrivals, departures });
}
