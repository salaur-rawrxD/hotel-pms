import { prisma } from "../utils/prisma.js";

function randomConfirmation() {
  return `M${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export async function listReservations(req, res) {
  const { status, source, date } = req.query;
  const where = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (date) {
    const day = new Date(date);
    const start = new Date(day.setHours(0, 0, 0, 0));
    const end = new Date(day.setHours(23, 59, 59, 999));
    where.OR = [
      { checkIn: { gte: start, lte: end } },
      { checkOut: { gte: start, lte: end } },
    ];
  }

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { checkIn: "desc" },
    include: {
      guest: true,
      room: true,
      roomType: true,
    },
  });

  res.json(reservations);
}

export async function getReservation(req, res) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: {
      guest: true,
      room: true,
      roomType: true,
      folio: true,
    },
  });

  if (!reservation) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }

  res.json(reservation);
}

export async function createReservation(req, res) {
  const data = req.body;
  const created = await prisma.reservation.create({
    data: {
      ...data,
      confirmationNumber: randomConfirmation(),
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
    },
  });
  res.status(201).json(created);
}

export async function updateReservation(req, res) {
  const data = { ...req.body };
  if (data.checkIn) data.checkIn = new Date(data.checkIn);
  if (data.checkOut) data.checkOut = new Date(data.checkOut);

  const updated = await prisma.reservation.update({
    where: { id: req.params.id },
    data,
  });
  res.json(updated);
}

export async function deleteReservation(req, res) {
  await prisma.reservation.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function checkIn(req, res) {
  const updated = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status: "CHECKED_IN" },
  });
  res.json(updated);
}

export async function checkOut(req, res) {
  const updated = await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status: "CHECKED_OUT" },
  });
  res.json(updated);
}
