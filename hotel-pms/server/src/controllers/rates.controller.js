import { prisma } from "../utils/prisma.js";

export async function listDailyRates(req, res) {
  const { roomTypeId, startDate, endDate } = req.query;
  const where = {};
  if (roomTypeId) where.roomTypeId = roomTypeId;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const rates = await prisma.dailyRate.findMany({
    where,
    orderBy: { date: "asc" },
  });

  res.json(rates);
}

export async function bulkUpsertDailyRates(req, res) {
  const { roomTypeId, entries } = req.body;

  const results = await prisma.$transaction(
    entries.map((entry) =>
      prisma.dailyRate.upsert({
        where: {
          roomTypeId_date: {
            roomTypeId,
            date: new Date(entry.date),
          },
        },
        update: {
          rate: entry.rate,
          minLOS: entry.minLOS,
          maxLOS: entry.maxLOS,
          closedToArrival: entry.closedToArrival,
          closedToDeparture: entry.closedToDeparture,
          isBlocked: entry.isBlocked,
        },
        create: {
          roomTypeId,
          date: new Date(entry.date),
          rate: entry.rate,
          minLOS: entry.minLOS,
          maxLOS: entry.maxLOS,
          closedToArrival: entry.closedToArrival,
          closedToDeparture: entry.closedToDeparture,
          isBlocked: entry.isBlocked,
        },
      }),
    ),
  );

  res.json({ updated: results.length });
}

export async function listRatePlans(_req, res) {
  const plans = await prisma.ratePlan.findMany({ orderBy: { name: "asc" } });
  res.json(plans);
}

export async function createRatePlan(req, res) {
  const created = await prisma.ratePlan.create({ data: req.body });
  res.status(201).json(created);
}
