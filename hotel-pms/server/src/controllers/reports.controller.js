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

export async function dailySummary(req, res) {
  const target = req.query.date ? new Date(req.query.date) : new Date();
  const start = startOfDay(target);
  const end = endOfDay(target);

  const [totalRooms, occupied, arrivals, departures] = await Promise.all([
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
  ]);

  res.json({
    date: start.toISOString(),
    totalRooms,
    occupied,
    occupancyPct: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
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
  const target = req.query.date ? new Date(req.query.date) : new Date();
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
