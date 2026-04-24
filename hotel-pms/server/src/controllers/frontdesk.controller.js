import { Prisma } from "@prisma/client";

import { prisma } from "../utils/prisma.js";

function randomConfirmation() {
  return `M${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function localDayBounds(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function nightCount(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.round(ms / 86400000) || 1);
}

function sumFolioNet(items) {
  return items
    .filter((i) => !i.voidedAt)
    .reduce((s, i) => s + Number(i.amount), 0);
}

export async function recomputeReservationBalance(reservationId) {
  const items = await prisma.folioItem.findMany({
    where: { reservationId, voidedAt: null },
  });
  const due = sumFolioNet(items);
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { balanceDue: new Prisma.Decimal(due.toFixed(2)) },
  });
  return due;
}

const fdInclude = {
  guest: true,
  room: { include: { roomType: true } },
  roomType: true,
  ratePlan: true,
  folio: { include: { postedBy: { select: { name: true, id: true } } } },
  keyCards: true,
  guestNotes: { orderBy: { createdAt: "desc" } },
};

function mapReservationRow(r) {
  const items = (r.folio || []).filter((f) => !f.voidedAt);
  const totalCharges = items
    .filter((f) => f.type !== "PAYMENT")
    .reduce((s, f) => s + Number(f.amount), 0);
  const totalPaid = items
    .filter((f) => f.type === "PAYMENT")
    .reduce((s, f) => s + Math.abs(Number(f.amount)), 0);
  return {
    ...r,
    totalCharges,
    totalPaid,
    balanceDue: Number(r.balanceDue),
  };
}

function enrichArrival(r) {
  const { start } = localDayBounds();
  const isEarlyCheckIn = new Date(r.checkIn).getHours() < 15;
  const nightsStaying = nightCount(r.checkIn, r.checkOut);
  const m = mapReservationRow(r);
  return { ...m, isEarlyCheckIn, nightsStaying, balanceDue: m.balanceDue };
}

function enrichDepartureSimple(r) {
  const all = r.folio.filter((f) => !f.voidedAt);
  const roomTotal = all
    .filter((f) => f.type === "ROOM")
    .reduce((s, f) => s + Math.abs(Number(f.amount)), 0);
  const extrasTotal = all
    .filter((f) => !["ROOM", "TAX", "PAYMENT", "DISCOUNT"].includes(f.type))
    .reduce((s, f) => s + (Number(f.amount) > 0 ? Number(f.amount) : 0), 0);
  const taxTotal = all
    .filter((f) => f.type === "TAX")
    .reduce((s, f) => s + Math.abs(Number(f.amount)), 0);
  const totalPaid = all
    .filter((f) => f.type === "PAYMENT")
    .reduce((s, f) => s + Math.abs(Number(f.amount)), 0);
  const totalCharges = all
    .filter((f) => f.type !== "PAYMENT")
    .reduce((s, f) => s + Number(f.amount), 0);
  const balanceDue = Number(r.balanceDue);
  const nightsStayed = r.actualCheckIn
    ? Math.max(1, nightCount(r.actualCheckIn, r.checkOut))
    : nightCount(r.checkIn, r.checkOut);
  const m = mapReservationRow(r);
  return {
    ...m,
    roomTotal,
    extrasTotal,
    taxTotal,
    totalCharges,
    totalPaid,
    balanceDue,
    nightsStayed,
    totalDue: totalCharges, // for card display
  };
}

function enrichInHouse(r) {
  const now = new Date();
  const msLeft = new Date(r.checkOut) - now;
  const nights = msLeft > 0 ? Math.ceil(msLeft / 86400000) : 0;
  return {
    ...mapReservationRow(r),
    nightsRemaining: nights,
    hasWakeUpCall: (r.wakeUpCalls && r.wakeUpCalls.length > 0) || false,
    doNotDisturb: r.doNotDisturb,
    balanceDue: Number(r.balanceDue),
  };
}

export async function getArrivals(_req, res) {
  const { start, end } = localDayBounds();
  const list = await prisma.reservation.findMany({
    where: {
      checkIn: { gte: start, lte: end },
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
    include: {
      ...fdInclude,
    },
    orderBy: { guest: { lastName: "asc" } },
  });
  res.json(list.map(enrichArrival));
}

export async function getDepartures(_req, res) {
  const { start, end } = localDayBounds();
  const list = await prisma.reservation.findMany({
    where: {
      checkOut: { gte: start, lte: end },
      status: "CHECKED_IN",
    },
    include: { ...fdInclude, wakeUpCalls: { where: { delivered: false } } },
    orderBy: { room: { number: "asc" } },
  });
  res.json(list.map(enrichDepartureSimple));
}

export async function getInHouse(_req, res) {
  const list = await prisma.reservation.findMany({
    where: { status: "CHECKED_IN" },
    include: {
      ...fdInclude,
      wakeUpCalls: { where: { delivered: false } },
    },
    orderBy: { room: { number: "asc" } },
  });
  res.json(
    list.map((r) =>
      enrichInHouse({ ...r, wakeUpCalls: r.wakeUpCalls }),
    ),
  );
}

export async function getGuestFolio(req, res) {
  const r = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: {
      guest: true,
      room: true,
      roomType: true,
      ratePlan: true,
      folio: {
        where: { voidedAt: null },
        orderBy: { postedAt: "asc" },
        include: { postedBy: { select: { name: true } } },
      },
    },
  });
  if (!r) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }
  const sorted = [...r.folio].sort((a, b) => a.postedAt - b.postedAt);
  let run = 0;
  const running = sorted.map((item) => {
    run += Number(item.amount);
    return { ...item, runningBalance: run };
  });
  const roomFees = sorted.filter((f) => f.type === "ROOM");
  const taxFees = sorted.filter((f) => f.type === "TAX");
  const totalRoom = roomFees.reduce((s, f) => s + Number(f.amount), 0);
  const totalTax = taxFees.reduce((s, f) => s + Number(f.amount), 0);
  res.json({
    ...r,
    balanceDue: Number(r.balanceDue),
    folioItems: running,
    totalCharges: sorted.filter((f) => f.type !== "PAYMENT").reduce((s, f) => s + Number(f.amount), 0),
    totalCredits: Math.abs(
      sorted.filter((f) => f.type === "PAYMENT").reduce((s, f) => s + Number(f.amount), 0),
    ),
    totalRoomCharges: totalRoom,
    totalTax,
    runningBalance: run,
  });
}

export async function checkIn(req, res) {
  const { id } = req.params;
  const {
    idVerified = true,
    paymentMethod = "CREDIT_CARD",
    extras = [],
    keyCount = 1,
  } = req.body;

  const existing = await prisma.reservation.findUnique({
    where: { id },
    include: { room: true, roomType: true, ratePlan: true, guest: true },
  });
  if (!existing) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }
  if (existing.status !== "CONFIRMED") {
    const err = new Error("Only CONFIRMED reservations can check in.");
    err.status = 400;
    throw err;
  }
  if (!existing.roomId) {
    const err = new Error("Please assign a room first");
    err.status = 400;
    throw err;
  }

  const nights = nightCount(existing.checkIn, existing.checkOut);
  const rate =
    existing.ratePlan != null
      ? Number(existing.ratePlan.baseRate)
      : Number(existing.roomType.baseRate);
  const subtotal = rate * nights;
  const tax = Math.round(subtotal * 0.14 * 100) / 100;

  const issuedBy = req.user.name ?? "Staff";

  await prisma.$transaction(async (tx) => {
    for (let n = 0; n < nights; n++) {
      const d = new Date(existing.checkIn);
      d.setDate(d.getDate() + n);
      await tx.folioItem.create({
        data: {
          reservationId: id,
          description: `Room night — ${d.toLocaleDateString()}`,
          amount: new Prisma.Decimal(rate.toFixed(2)),
          type: "ROOM",
          postedById: req.user.id,
        },
      });
    }
    await tx.folioItem.create({
      data: {
        reservationId: id,
        description: "Tax (14%)",
        amount: new Prisma.Decimal(tax.toFixed(2)),
        type: "TAX",
        postedById: req.user.id,
      },
    });
    for (const ex of extras) {
      await tx.folioItem.create({
        data: {
          reservationId: id,
          description: ex.description,
          amount: new Prisma.Decimal(Number(ex.amount).toFixed(2)),
          type: ex.type ?? "OTHER",
          postedById: req.user.id,
        },
      });
    }
    if (Number(existing.depositPaid) > 0) {
      await tx.folioItem.create({
        data: {
          reservationId: id,
          description: "Deposit / payment on file",
          amount: new Prisma.Decimal((-Number(existing.depositPaid)).toFixed(2)),
          type: "PAYMENT",
          postedById: req.user.id,
        },
      });
    }
    for (let k = 1; k <= Math.min(4, Math.max(1, Number(keyCount) || 1)); k += 1) {
      await tx.keyCard.create({
        data: {
          reservationId: id,
          keyNumber: k,
          issuedBy,
        },
      });
    }
    const items = await tx.folioItem.findMany({
      where: { reservationId: id, voidedAt: null },
    });
    const due = sumFolioNet(items);
    await tx.reservation.update({
      where: { id },
      data: {
        status: "CHECKED_IN",
        actualCheckIn: new Date(),
        idVerified: Boolean(idVerified),
        paymentMethod: String(paymentMethod),
        balanceDue: new Prisma.Decimal(due.toFixed(2)),
        earlyCheckIn: new Date().getHours() < 15,
      },
    });
    await tx.room.update({
      where: { id: existing.roomId },
      data: { status: "OCCUPIED", currentGuestId: existing.guestId },
    });
  });

  const full = await prisma.reservation.findUnique({
    where: { id },
    include: { ...fdInclude, guest: true },
  });
  res.json({ ...mapReservationRow(full), folio: full.folio });
}

export async function checkOut(req, res) {
  const { id } = req.params;
  const { paymentCaptured = false, ...rest } = req.body;

  const r = await prisma.reservation.findUnique({
    where: { id },
    include: { room: true, folio: true, guest: true },
  });
  if (!r) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }
  if (r.status !== "CHECKED_IN") {
    const err = new Error("Only checked-in reservations can check out.");
    err.status = 400;
    throw err;
  }
  await recomputeReservationBalance(id);
  const r2 = await prisma.reservation.findUnique({ where: { id } });
  const bal = Number(r2.balanceDue);
  if (bal > 0.009 && !paymentCaptured) {
    const err = new Error(`Balance due: $${bal.toFixed(2)}. Please capture payment first`);
    err.status = 400;
    throw err;
  }

  const roomId = r.roomId;

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id },
      data: {
        status: "CHECKED_OUT",
        actualCheckOut: new Date(),
        ...("rating" in rest && rest.rating != null
          ? {}
          : {}),
      },
    });
    if (roomId) {
      await tx.room.update({
        where: { id: roomId },
        data: { status: "DIRTY", currentGuestId: null },
      });
      await tx.housekeepingTask.create({
        data: {
          roomId,
          taskType: "CHECKOUT",
          status: "PENDING",
          priority: 1,
          notes: `Guest checkout — ${r.guest ? `${r.guest.firstName} ${r.guest.lastName}` : "Guest"}`,
        },
      });
    }
    await tx.keyCard.updateMany({
      where: { reservationId: id },
      data: { isActive: false },
    });
  });
  if (r.room && (rest.feedback != null || rest.rating != null)) {
    // optional store on guest.notes
    if (r.guestId && (rest.stayNote || rest.feedback)) {
      await prisma.guest.update({
        where: { id: r.guestId },
        data: {
          notes: [rest.stayNote || rest.feedback, rest.rating != null ? `Rating: ${rest.rating}/5` : ""]
            .filter(Boolean)
            .join(" | "),
        },
      });
    }
  }
  const summary = await prisma.reservation.findUnique({
    where: { id },
    include: { folio: true, room: true, guest: true },
  });
  res.json({
    message: "Checked out",
    registrationId: id,
    roomNumber: r.room?.number,
    finalFolio: summary.folio,
    balance: Number(summary.balanceDue),
  });
}

async function assignRoomToReservation(reservationId, roomId) {
  const [resv, room] = await Promise.all([
    prisma.reservation.findUnique({ where: { id: reservationId } }),
    prisma.room.findUnique({ where: { id: roomId } }),
  ]);
  if (!resv) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }
  if (!room) {
    const err = new Error("Room not found.");
    err.status = 404;
    throw err;
  }
  if (room.roomTypeId !== resv.roomTypeId) {
    const err = new Error("Room type does not match the reservation.");
    err.status = 400;
    throw err;
  }
  if (!["VACANT", "CLEAN"].includes(room.status)) {
    const err = new Error("Room is not available for assignment.");
    err.status = 400;
    throw err;
  }
  const oldRoomId = resv.roomId;
  await prisma.$transaction(async (tx) => {
    if (oldRoomId && oldRoomId !== roomId) {
      await tx.room.update({
        where: { id: oldRoomId },
        data: { status: "VACANT", currentGuestId: null },
      });
    }
    await tx.reservation.update({
      where: { id: reservationId },
      data: { roomId },
    });
    await tx.room.update({
      where: { id: roomId },
      data: { status: "DUE_IN" },
    });
  });
  return prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { ...fdInclude },
  });
}

export async function assignRoom(req, res) {
  const { id } = req.params;
  const { roomId } = req.body;
  if (!roomId) {
    const err = new Error("roomId is required.");
    err.status = 400;
    throw err;
  }
  const updated = await assignRoomToReservation(id, roomId);
  res.json(mapReservationRow(updated));
}

export async function addFolioItem(req, res) {
  const { id } = req.params;
  const { description, amount, type = "OTHER" } = req.body;
  if (!description || amount == null) {
    const err = new Error("description and amount are required.");
    err.status = 400;
    throw err;
  }
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }
  await prisma.folioItem.create({
    data: {
      reservationId: id,
      description,
      amount: new Prisma.Decimal(Number(amount).toFixed(2)),
      type,
      postedById: req.user.id,
    },
  });
  await recomputeReservationBalance(id);
  const full = await prisma.reservation.findUnique({
    where: { id },
    include: { folio: { include: { postedBy: { select: { name: true } } } } },
  });
  res.json({ folio: full.folio, balanceDue: Number(full.balanceDue) });
}

export async function removeFolioItem(req, res) {
  const { id, itemId } = req.params;
  const r = await prisma.folioItem.findFirst({
    where: { id: itemId, reservationId: id },
  });
  if (!r) {
    const err = new Error("Folio line not found.");
    err.status = 404;
    throw err;
  }
  await prisma.folioItem.update({
    where: { id: itemId },
    data: { voidedAt: new Date() },
  });
  await recomputeReservationBalance(id);
  const full = await prisma.reservation.findUnique({
    where: { id },
    include: { folio: true },
  });
  res.json({ folio: full.folio, balanceDue: Number(full.balanceDue) });
}

export async function createWalkIn(req, res) {
  const b = req.body;
  const email = b.email?.toLowerCase();
  if (!b.firstName || !b.lastName || !email || !b.phone) {
    const err = new Error("firstName, lastName, email, and phone are required.");
    err.status = 400;
    throw err;
  }
  let guest = await prisma.guest.findFirst({ where: { email } });
  if (!guest) {
    guest = await prisma.guest.create({
      data: {
        firstName: b.firstName,
        lastName: b.lastName,
        email,
        phone: b.phone,
        nationality: b.nationality ?? "US",
        idType: b.idType,
        idNumber: b.idNumber,
      },
    });
  }
  const checkIn = new Date();
  checkIn.setHours(15, 0, 0, 0);
  const checkOut = new Date(b.checkOut || b.checkOutDate);
  if (Number.isNaN(checkOut.getTime())) {
    const err = new Error("Valid checkOut date is required.");
    err.status = 400;
    throw err;
  }
  const nights = nightCount(checkIn, checkOut);
  const roomType = await prisma.roomType.findFirst({ where: { id: b.roomTypeId } });
  if (!roomType) {
    const err = new Error("roomTypeId is required and must exist.");
    err.status = 400;
    throw err;
  }
  const rate = b.rate != null ? Number(b.rate) : Number(roomType.baseRate);
  const total = Number((rate * nights * 1.14).toFixed(2));
  const plan =
    (b.ratePlanId &&
      (await prisma.ratePlan.findFirst({ where: { id: b.ratePlanId } }))) ||
    (await prisma.ratePlan.findFirst());
  if (!plan) {
    const err = new Error("A rate plan is required. Configure rate plans first.");
    err.status = 400;
    throw err;
  }
  const resv = await prisma.reservation.create({
    data: {
      confirmationNumber: randomConfirmation(),
      guestId: guest.id,
      roomId: b.roomId ?? null,
      roomTypeId: roomType.id,
      checkIn,
      checkOut,
      adults: b.adults ?? 2,
      children: b.children ?? 0,
      status: "CONFIRMED",
      source: "WALKIN",
      ratePlanId: plan.id,
      totalAmount: new Prisma.Decimal(total.toFixed(2)),
      depositPaid: 0,
      specialRequests: b.specialRequests,
      paymentMethod: b.paymentMethod,
    },
  });
  if (b.roomId) {
    const status = b.immediateCheckIn ? "DUE_IN" : "DUE_IN";
    await prisma.room.update({
      where: { id: b.roomId },
      data: { status },
    });
  }
  res.status(201).json(
    mapReservationRow(
      await prisma.reservation.findUnique({
        where: { id: resv.id },
        include: { ...fdInclude },
      }),
    ),
  );
}

export async function addGuestNote(req, res) {
  const { id } = req.params;
  const { note, type = "GENERAL" } = req.body;
  if (!note) {
    const err = new Error("note is required.");
    err.status = 400;
    throw err;
  }
  const resv = await prisma.reservation.findUnique({ where: { id } });
  if (!resv) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }
  const n = await prisma.guestNote.create({
    data: {
      reservationId: id,
      note,
      type,
      createdBy: req.user.name ?? "Staff",
    },
  });
  res.status(201).json(n);
}

export async function updateQuickAction(req, res) {
  const { id } = req.params;
  const b = req.body;
  const action = b.action;
  const r = await prisma.reservation.findUnique({ where: { id }, include: { keyCards: true, wakeUpCalls: true } });
  if (!r) {
    const err = new Error("Reservation not found.");
    err.status = 404;
    throw err;
  }

  if (action === "doNotDisturb") {
    await prisma.reservation.update({
      where: { id },
      data: { doNotDisturb: Boolean(b.value ?? !r.doNotDisturb) },
    });
  } else if (action === "lateCheckOut") {
    await prisma.reservation.update({
      where: { id },
      data: {
        lateCheckOut: Boolean(b.enabled ?? true),
        lateCheckOutFee: b.fee != null ? new Prisma.Decimal(Number(b.fee).toFixed(2)) : r.lateCheckOutFee,
      },
    });
  } else if (action === "vipGuest") {
    await prisma.reservation.update({
      where: { id },
      data: { vipGuest: Boolean(b.value ?? !r.vipGuest) },
    });
  } else if (action === "issueNewKey") {
    const next =
      (r.keyCards?.reduce((m, k) => Math.max(m, k.keyNumber), 0) ?? 0) + 1;
    await prisma.keyCard.create({
      data: {
        reservationId: id,
        keyNumber: next,
        issuedBy: req.user.name ?? "Staff",
      },
    });
  } else if (action === "addWakeUpCall") {
    if (!b.scheduledFor) {
      const err = new Error("scheduledFor is required for wake-up call.");
      err.status = 400;
      throw err;
    }
    await prisma.wakeUpCall.create({
      data: {
        reservationId: id,
        scheduledFor: new Date(b.scheduledFor),
      },
    });
  } else if (action === "moveRoom") {
    if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
      const err = new Error("Only managers can move rooms.");
      err.status = 403;
      throw err;
    }
    if (!b.roomId) {
      const err = new Error("roomId is required.");
      err.status = 400;
      throw err;
    }
    if (b.roomId === r.roomId) {
      // no-op
    } else {
      const newRoom = await prisma.room.findUnique({ where: { id: b.roomId } });
      if (!newRoom || newRoom.roomTypeId !== r.roomTypeId) {
        const err = new Error("Invalid room for this reservation type.");
        err.status = 400;
        throw err;
      }
      if (r.status === "CHECKED_IN") {
        if (!["VACANT", "CLEAN", "DUE_IN"].includes(newRoom.status)) {
          const err = new Error("Target room is not available.");
          err.status = 400;
          throw err;
        }
        await prisma.$transaction(async (tx) => {
          if (r.roomId) {
            await tx.room.update({
              where: { id: r.roomId },
              data: { status: "CLEAN", currentGuestId: null },
            });
          }
          await tx.reservation.update({ where: { id }, data: { roomId: b.roomId } });
          await tx.room.update({
            where: { id: b.roomId },
            data: { status: "OCCUPIED", currentGuestId: r.guestId },
          });
        });
      } else {
        await assignRoomToReservation(id, b.roomId);
      }
    }
  } else if (action === "earlyDeparture" && b.newCheckOut) {
    const d = new Date(b.newCheckOut);
    await prisma.reservation.update({
      where: { id },
      data: { checkOut: d },
    });
    await recomputeReservationBalance(id);
  } else {
    const err = new Error("Unknown or unsupported action.");
    err.status = 400;
    throw err;
  }

  const full = await prisma.reservation.findUnique({
    where: { id },
    include: { ...fdInclude, wakeUpCalls: true },
  });
  res.json(mapReservationRow(full));
}

export async function getNightAudit(req, res) {
  const { start, end } = localDayBounds();
  const now = new Date();
  const isAfter11pm = now.getHours() >= 23;

  const [allRooms, checkedIn, todayArrivals, noShowCands] = await Promise.all([
    prisma.room.findMany(),
    prisma.reservation.findMany({ where: { status: "CHECKED_IN" } }),
    prisma.reservation.findMany({
      where: {
        actualCheckIn: { gte: start, lte: end },
        status: "CHECKED_IN",
      },
    }),
    isAfter11pm
      ? prisma.reservation.findMany({
          where: {
            status: "CONFIRMED",
            checkIn: { gte: start, lte: end },
          },
        })
      : [],
  ]);
  const checkedOutToday = await prisma.reservation.findMany({
    where: {
      status: "CHECKED_OUT",
      actualCheckOut: { gte: start, lte: end },
    },
  });

  const totalArrivals = todayArrivals.length;
  const totalDepartures = checkedOutToday.length;
  const noShows = noShowCands.filter((r) => r.status === "CONFIRMED").length;
  const inHouseCount = checkedIn.length;
  const roomsOccupied = allRooms.filter((r) => r.status === "OCCUPIED").length;
  const roomsVacant = allRooms.filter((r) => r.status === "VACANT").length;
  const total = allRooms.length;
  const occupancyPercent = total ? Math.round((roomsOccupied / total) * 1000) / 10 : 0;

  const folioToday = await prisma.folioItem.findMany({
    where: {
      voidedAt: null,
      postedAt: { gte: start, lte: end },
    },
  });
  const totalRevenue = folioToday
    .filter((f) => f.type === "ROOM")
    .reduce((s, f) => s + Number(f.amount), 0);
  const totalTax = folioToday
    .filter((f) => f.type === "TAX")
    .reduce((s, f) => s + Number(f.amount), 0);
  const fb = folioToday
    .filter((f) => ["FOOD", "BEVERAGE"].includes(f.type))
    .reduce((s, f) => s + Number(f.amount), 0);
  const other = folioToday
    .filter((f) => f.type === "OTHER")
    .reduce((s, f) => s + Number(f.amount), 0);
  const outstanding = await prisma.reservation.aggregate({
    where: { status: "CHECKED_IN" },
    _sum: { balanceDue: true },
  });
  const outstandingBalances = Number(outstanding._sum.balanceDue ?? 0);
  const listDue = await prisma.reservation.findMany({
    where: { status: "CHECKED_IN", balanceDue: { gt: new Prisma.Decimal(0) } },
    include: { guest: true, room: true },
  });
  const adr = roomsOccupied > 0 ? totalRevenue / roomsOccupied : 0;
  res.json({
    date: start.toISOString(),
    runBy: req.user?.name,
    time: new Date().toISOString(),
    totalArrivals,
    totalDepartures,
    noShows,
    inHouseCount,
    totalRevenue: totalRevenue + totalTax, // "room revenue" often pretax; keep breakdown
    roomRevenue: totalRevenue,
    totalTax,
    fAndBRevenue: fb,
    otherCharges: other,
    totalRevenueAll: totalRevenue + totalTax + fb + other,
    outstandingBalances,
    outstandingList: listDue.map((r) => ({
      id: r.id,
      name: r.guest ? `${r.guest.firstName} ${r.guest.lastName}` : "",
      room: r.room?.number,
      amount: Number(r.balanceDue),
    })),
    roomsOccupied,
    roomsVacant,
    occupancyPercent,
    averageDailyRate: Math.round(adr * 100) / 100,
  });
}
