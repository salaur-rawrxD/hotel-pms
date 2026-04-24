import { prisma } from "../utils/prisma.js";

export async function listGuests(req, res) {
  const { q } = req.query;
  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  const guests = await prisma.guest.findMany({
    where,
    orderBy: { lastName: "asc" },
    take: 100,
  });

  res.json(guests);
}

export async function getGuest(req, res) {
  const guest = await prisma.guest.findUnique({
    where: { id: req.params.id },
    include: {
      reservations: { orderBy: { checkIn: "desc" }, take: 20 },
    },
  });

  if (!guest) {
    const err = new Error("Guest not found.");
    err.status = 404;
    throw err;
  }

  res.json(guest);
}

export async function createGuest(req, res) {
  const created = await prisma.guest.create({ data: req.body });
  res.status(201).json(created);
}

export async function updateGuest(req, res) {
  const updated = await prisma.guest.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
}
