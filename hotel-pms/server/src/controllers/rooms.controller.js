import { prisma } from "../utils/prisma.js";

export async function listRooms(req, res) {
  const { status, floor } = req.query;
  const where = {};
  if (status) where.status = status;
  if (floor) where.floor = Number(floor);

  const rooms = await prisma.room.findMany({
    where,
    orderBy: { number: "asc" },
    include: {
      roomType: true,
      currentGuest: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  res.json(rooms);
}

export async function getRoom(req, res) {
  const room = await prisma.room.findUnique({
    where: { id: req.params.id },
    include: {
      roomType: true,
      currentGuest: true,
      reservations: {
        where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } },
        orderBy: { checkIn: "asc" },
        take: 10,
      },
    },
  });

  if (!room) {
    const err = new Error("Room not found.");
    err.status = 404;
    throw err;
  }

  res.json(room);
}

export async function updateRoomStatus(req, res) {
  const { status } = req.body;

  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: { status },
  });

  res.json(room);
}
