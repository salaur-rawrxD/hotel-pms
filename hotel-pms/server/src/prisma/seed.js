import "dotenv/config";

import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(15, 0, 0, 0);
  return d;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function makeConfirmation(seed) {
  return `M${seed.toString(36).toUpperCase().padStart(6, "0")}`;
}

async function main() {
  console.log("🌱 Seeding Hotel PMS database…");

  console.log("  → clearing existing data");
  await prisma.roomChecklistItem.deleteMany();
  await prisma.roomChecklist.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklistTemplate.deleteMany();
  await prisma.supplyRequest.deleteMany();
  await prisma.lostAndFound.deleteMany();
  await prisma.folioItem.deleteMany();
  await prisma.keyCard.deleteMany();
  await prisma.wakeUpCall.deleteMany();
  await prisma.guestNote.deleteMany();
  await prisma.housekeepingTask.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.dailyRate.deleteMany();
  await prisma.ratePlan.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.property.deleteMany();

  console.log("  → property");
  const property = await prisma.property.create({
    data: {
      name: "The Meridian Hotel",
      address: "5000 Hopyard Road, Pleasanton, CA 94588",
      phone: "+1 (925) 555-0100",
      email: "hello@meridian.com",
      totalRooms: 48,
      timezone: "America/Los_Angeles",
    },
  });

  console.log("  → users");
  const passwordHash = await bcrypt.hash("password123", 10);
  const userSeed = [
    { email: "admin@meridian.com",         name: "Alex Rivera",    role: "ADMIN" },
    { email: "manager@meridian.com",       name: "Jordan Pierce",  role: "MANAGER" },
    { email: "frontdesk1@meridian.com",    name: "Maya Chen",      role: "FRONT_DESK" },
    { email: "frontdesk2@meridian.com",    name: "Kai Patel",      role: "FRONT_DESK" },
    { email: "housekeeping1@meridian.com", name: "Maria Santos",   role: "HOUSEKEEPING" },
    { email: "housekeeping2@meridian.com", name: "James Okafor",   role: "HOUSEKEEPING" },
    { email: "housekeeping3@meridian.com", name: "Linda Park",     role: "HOUSEKEEPING" },
    { email: "housekeeping4@meridian.com", name: "Carlos Mendez",  role: "HOUSEKEEPING" },
    { email: "housekeeping5@meridian.com", name: "Aisha Williams", role: "HOUSEKEEPING" },
  ];

  const users = [];
  for (const u of userSeed) {
    users.push(
      await prisma.user.create({
        data: { ...u, passwordHash, propertyId: property.id },
      }),
    );
  }
  const [admin, manager, fd1, fd2, maria, james, linda, carlos, aisha] = users;
  const housekeepers = [maria, james, linda, carlos, aisha];
  // Legacy aliases kept so existing HK task seed below still works.
  const hk1 = maria;
  const hk2 = james;

  console.log("  → room types");
  const roomTypeSeed = [
    { name: "Standard King",   baseRate: 189, maxOccupancy: 2, amenities: ["King bed", "Smart TV", "Fast Wi-Fi"] },
    { name: "Standard Double", baseRate: 199, maxOccupancy: 4, amenities: ["Two queen beds", "Smart TV", "Fast Wi-Fi"] },
    { name: "Deluxe King",     baseRate: 249, maxOccupancy: 2, amenities: ["King bed", "City view", "Mini bar", "Soaking tub"] },
    { name: "Junior Suite",    baseRate: 329, maxOccupancy: 3, amenities: ["Separate sitting area", "King bed", "Nespresso"] },
    { name: "Penthouse Suite", baseRate: 899, maxOccupancy: 4, amenities: ["Rooftop terrace", "Kitchenette", "Fireplace"] },
  ];
  const roomTypes = [];
  for (const rt of roomTypeSeed) {
    roomTypes.push(
      await prisma.roomType.create({
        data: {
          ...rt,
          amenities: JSON.stringify(rt.amenities),
          propertyId: property.id,
        },
      }),
    );
  }
  const [standardKing, standardDouble, deluxeKing, juniorSuite, penthouseSuite] = roomTypes;

  console.log("  → rooms (48 across 3 floors)");
  const rooms = [];
  for (const floor of [1, 2, 3]) {
    for (let i = 1; i <= 16; i++) {
      const number = `${floor}${i.toString().padStart(2, "0")}`;
      let roomType;
      if (i === 16) roomType = penthouseSuite;
      else if (i >= 14) roomType = juniorSuite;
      else if (i >= 10) roomType = deluxeKing;
      else if (i % 2 === 0) roomType = standardDouble;
      else roomType = standardKing;

      rooms.push(
        await prisma.room.create({
          data: {
            number,
            floor,
            roomTypeId: roomType.id,
            status: "VACANT",
          },
        }),
      );
    }
  }

  console.log("  → guests");
  const guestSeed = [
    { firstName: "Emma",    lastName: "Johnson",  email: "emma.johnson@example.com",  nationality: "US", loyaltyTier: "GOLD",     loyaltyPoints: 24580 },
    { firstName: "Liam",    lastName: "Garcia",   email: "liam.garcia@example.com",   nationality: "US", loyaltyTier: "SILVER",   loyaltyPoints: 8120 },
    { firstName: "Sophia",  lastName: "Nguyen",   email: "sophia.nguyen@example.com", nationality: "US", loyaltyTier: "PLATINUM", loyaltyPoints: 68210 },
    { firstName: "Noah",    lastName: "Brown",    email: "noah.brown@example.com",    nationality: "CA", loyaltyTier: "BRONZE",   loyaltyPoints: 1250 },
    { firstName: "Olivia",  lastName: "Martinez", email: "olivia.martinez@example.com", nationality: "MX", loyaltyTier: "NONE",   loyaltyPoints: 0 },
    { firstName: "Ethan",   lastName: "Lee",      email: "ethan.lee@example.com",     nationality: "KR", loyaltyTier: "GOLD",     loyaltyPoints: 19330 },
    { firstName: "Ava",     lastName: "Kumar",    email: "ava.kumar@example.com",     nationality: "IN", loyaltyTier: "SILVER",   loyaltyPoints: 5200 },
    { firstName: "Mason",   lastName: "Wilson",   email: "mason.wilson@example.com",  nationality: "UK", loyaltyTier: "NONE",     loyaltyPoints: 0 },
    { firstName: "Isabella",lastName: "Rossi",    email: "isabella.rossi@example.com",nationality: "IT", loyaltyTier: "BRONZE",   loyaltyPoints: 600 },
    { firstName: "James",   lastName: "Dubois",   email: "james.dubois@example.com",  nationality: "FR", loyaltyTier: "GOLD",     loyaltyPoints: 17900 },
  ];
  const guests = [];
  for (const g of guestSeed) {
    guests.push(await prisma.guest.create({ data: g }));
  }

  console.log("  → rate plans");
  const ratePlanSeed = [
    { name: "BAR",             description: "Best Available Rate",   baseRate: 199, isRefundable: true,  breakfastIncluded: false },
    { name: "AAA",             description: "AAA member discount",   baseRate: 179, isRefundable: true,  breakfastIncluded: false },
    { name: "Corporate",       description: "Negotiated corporate",  baseRate: 169, isRefundable: true,  breakfastIncluded: true  },
    { name: "Non-Refundable",  description: "Prepaid, non-refundable", baseRate: 149, isRefundable: false, breakfastIncluded: false },
  ];
  const ratePlans = [];
  for (const rp of ratePlanSeed) {
    ratePlans.push(
      await prisma.ratePlan.create({
        data: { ...rp, propertyId: property.id },
      }),
    );
  }
  const [bar] = ratePlans;

  console.log("  → daily rates (60 days)");
  const today = startOfDay(new Date());
  const dailyData = [];
  for (const rt of roomTypes) {
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dow = date.getDay();
      const weekendBump = dow === 5 || dow === 6 ? 1.15 : 1.0;
      dailyData.push({
        roomTypeId: rt.id,
        date,
        rate: Number((Number(rt.baseRate) * weekendBump).toFixed(2)),
        minLOS: 1,
        maxLOS: 30,
        closedToArrival: false,
        closedToDeparture: false,
        isBlocked: false,
      });
    }
  }
  await prisma.dailyRate.createMany({ data: dailyData });

  console.log("  → reservations (15)");
  const resSpec = [
    // Checked-in (5)
    { guest: 0, nightsAgo: 2, nights: 4, status: "CHECKED_IN", source: "DIRECT",    roomIdx: 0 },
    { guest: 2, nightsAgo: 1, nights: 5, status: "CHECKED_IN", source: "EXPEDIA",   roomIdx: 7 },
    { guest: 5, nightsAgo: 3, nights: 6, status: "CHECKED_IN", source: "BOOKING",   roomIdx: 14 },
    { guest: 9, nightsAgo: 1, nights: 3, status: "CHECKED_IN", source: "CORPORATE", roomIdx: 16 },
    { guest: 7, nightsAgo: 2, nights: 4, status: "CHECKED_IN", source: "DIRECT",    roomIdx: 36 },
    // Arriving today (3)
    { guest: 1, nightsAgo: 0, nights: 2, status: "CONFIRMED", source: "AIRBNB",    roomIdx: 38 },
    { guest: 3, nightsAgo: 0, nights: 3, status: "CONFIRMED", source: "DIRECT",    roomIdx: 42 },
    { guest: 6, nightsAgo: 0, nights: 1, status: "CONFIRMED", source: "WALKIN",    roomIdx: 45 },
    // Departing today (2)
    { guest: 4, nightsAgo: 3, nights: 3, status: "CHECKED_IN", source: "BOOKING",  roomIdx: 11 },
    { guest: 8, nightsAgo: 2, nights: 2, status: "CHECKED_IN", source: "DIRECT",   roomIdx: 25 },
    // Future (3)
    { guest: 0, nightsAgo: -7, nights: 3, status: "CONFIRMED", source: "DIRECT",    roomIdx: null },
    { guest: 2, nightsAgo: -14, nights: 5, status: "CONFIRMED", source: "EXPEDIA",  roomIdx: null },
    { guest: 5, nightsAgo: -21, nights: 2, status: "CONFIRMED", source: "CORPORATE",roomIdx: null },
    // Cancelled (1)
    { guest: 8, nightsAgo: -4, nights: 2, status: "CANCELLED", source: "AIRBNB",    roomIdx: null },
    // Checked-out (1)
    { guest: 1, nightsAgo: 10, nights: 3, status: "CHECKED_OUT", source: "BOOKING", roomIdx: 5 },
  ];

  for (let i = 0; i < resSpec.length; i++) {
    const spec = resSpec[i];
    const guest = guests[spec.guest];
    const room = spec.roomIdx != null ? rooms[spec.roomIdx] : null;
    const roomType = room
      ? roomTypes.find((rt) => rt.id === room.roomTypeId)
      : roomTypes[i % roomTypes.length];
    const checkIn = addDays(today, -spec.nightsAgo);
    const checkOut = addDays(checkIn, spec.nights);
    checkOut.setHours(11, 0, 0, 0);
    const nightly = Number(roomType.baseRate);
    const total = Number((nightly * spec.nights * 1.12).toFixed(2));
    const deposit =
      spec.status === "CHECKED_IN" ? Number((total * 0.3).toFixed(2)) : 0;

    const resRow = await prisma.reservation.create({
      data: {
        confirmationNumber: makeConfirmation(1000 + i),
        guestId: guest.id,
        roomId: room?.id ?? null,
        roomTypeId: roomType.id,
        checkIn,
        checkOut,
        adults: 2,
        children: 0,
        status: spec.status,
        source: spec.source,
        ratePlanId: bar.id,
        totalAmount: total,
        depositPaid: new Prisma.Decimal(deposit.toFixed(2)),
        specialRequests:
          i % 3 === 0 ? "High floor if possible." : null,
        vipGuest: false,
        idVerified: spec.status === "CHECKED_IN",
        paymentMethod: spec.status === "CHECKED_IN" ? "CREDIT_CARD" : null,
        actualCheckIn: spec.status === "CHECKED_IN" ? checkIn : null,
        balanceDue: new Prisma.Decimal(0),
      },
    });

    if (room && spec.status === "CHECKED_IN") {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: "OCCUPIED", currentGuestId: guest.id },
      });

      const nights = spec.nights;
      const subtotal = nightly * nights;
      const tax = Math.round(subtotal * 0.14 * 100) / 100;
      const minibar = i % 2 === 0 ? 24.5 : 12;

      for (let n = 0; n < nights; n++) {
        const d = new Date(checkIn);
        d.setDate(d.getDate() + n);
        await prisma.folioItem.create({
          data: {
            reservationId: resRow.id,
            description: `Room — ${d.toLocaleDateString()}`,
            amount: new Prisma.Decimal(nightly.toFixed(2)),
            type: "ROOM",
            postedById: admin.id,
          },
        });
      }
      await prisma.folioItem.create({
        data: {
          reservationId: resRow.id,
          description: "Tax (14%)",
          amount: new Prisma.Decimal(tax.toFixed(2)),
          type: "TAX",
          postedById: admin.id,
        },
      });
      await prisma.folioItem.create({
        data: {
          reservationId: resRow.id,
          description: "Resort & services",
          amount: new Prisma.Decimal(minibar.toFixed(2)),
          type: "OTHER",
          postedById: admin.id,
        },
      });
      if (deposit > 0) {
        await prisma.folioItem.create({
          data: {
            reservationId: resRow.id,
            description: "Deposit received",
            amount: new Prisma.Decimal((-deposit).toFixed(2)),
            type: "PAYMENT",
            postedById: admin.id,
          },
        });
      }
      const balance =
        subtotal + tax + minibar - deposit;
      const isVip =
        (spec.guest === 0 || spec.guest === 2) && spec.status === "CHECKED_IN";
      await prisma.reservation.update({
        where: { id: resRow.id },
        data: {
          balanceDue: new Prisma.Decimal(balance.toFixed(2)),
          vipGuest: isVip,
        },
      });
      await prisma.keyCard.create({
        data: {
          reservationId: resRow.id,
          keyNumber: 1,
          issuedBy: admin.name,
        },
      });
    }
  }

  const room201 = rooms.find((r) => r.number === "201");
  const room305 = rooms.find((r) => r.number === "305");
  const tomorrow = addDays(today, 1);
  if (room201) {
    const res201 = await prisma.reservation.findFirst({
      where: { roomId: room201.id, status: "CHECKED_IN" },
    });
    if (res201) {
      const t1 = new Date(tomorrow);
      t1.setHours(6, 30, 0, 0);
      await prisma.wakeUpCall.create({
        data: { reservationId: res201.id, scheduledFor: t1 },
      });
    }
  }
  if (room305) {
    const res305 = await prisma.reservation.findFirst({
      where: { roomId: room305.id, status: "CHECKED_IN" },
    });
    if (res305) {
      const t2 = new Date(tomorrow);
      t2.setHours(7, 0, 0, 0);
      await prisma.wakeUpCall.create({
        data: { reservationId: res305.id, scheduledFor: t2 },
      });
    }
  }

  // ────────────────────────────────────────────────
  // Housekeeping module seed
  // ────────────────────────────────────────────────

  console.log("  → checklist templates (3)");

  const standardCheckoutItems = [
    // Bathroom
    { category: "Bathroom", label: "Replace all towels and linens" },
    { category: "Bathroom", label: "Clean and disinfect toilet" },
    { category: "Bathroom", label: "Clean sink and vanity" },
    { category: "Bathroom", label: "Clean shower/tub" },
    { category: "Bathroom", label: "Replace toiletries (shampoo, soap, conditioner, lotion)" },
    { category: "Bathroom", label: "Empty trash and replace liner" },
    { category: "Bathroom", label: "Clean mirror" },
    { category: "Bathroom", label: "Mop bathroom floor" },
    // Bedroom
    { category: "Bedroom", label: "Strip and remake bed with fresh linens" },
    { category: "Bedroom", label: "Dust all surfaces" },
    { category: "Bedroom", label: "Vacuum carpet / mop hard floor" },
    { category: "Bedroom", label: "Wipe down nightstands" },
    { category: "Bedroom", label: "Check and clear all drawers" },
    { category: "Bedroom", label: "Inspect under bed" },
    { category: "Bedroom", label: "Replace all pillowcases" },
    { category: "Bedroom", label: "Straighten artwork and decor" },
    // General
    { category: "General", label: "Empty all trash bins" },
    { category: "General", label: "Wipe down TV remote with disinfectant" },
    { category: "General", label: "Check all lights are working" },
    { category: "General", label: "Restock coffee station" },
    { category: "General", label: "Wipe down desk and chair" },
    { category: "General", label: "Check iron and ironing board" },
    { category: "General", label: "Check all USB/power outlets" },
    { category: "General", label: "Close and lock all windows" },
    { category: "General", label: "Set thermostat to 68°F" },
    { category: "General", label: "Final walkthrough inspection" },
    { category: "General", label: "Take photo of completed room" },
  ];

  const stayOverItems = [
    { category: "Bathroom", label: "Replace used towels if left on floor" },
    { category: "Bathroom", label: "Wipe down sink and vanity" },
    { category: "Bathroom", label: "Clean toilet" },
    { category: "Bathroom", label: "Restock toiletries as needed" },
    { category: "Bathroom", label: "Empty trash" },
    { category: "Bedroom", label: "Make bed (do not change linens unless requested)" },
    { category: "Bedroom", label: "Tidy and straighten room" },
    { category: "Bedroom", label: "Vacuum if needed" },
    { category: "Bedroom", label: "Dust visible surfaces" },
    { category: "General", label: "Restock coffee and tea" },
    { category: "General", label: "Empty trash bins" },
    { category: "General", label: "Check lights working" },
    { category: "General", label: "Leave \"We cleaned your room\" card" },
  ];

  const deepCleanExtra = [
    { category: "Bedroom", label: "Clean inside all drawers" },
    { category: "Bedroom", label: "Wipe down all walls" },
    { category: "Bedroom", label: "Clean light fixtures" },
    { category: "Bedroom", label: "Move furniture and clean underneath" },
    { category: "General",  label: "Clean inside refrigerator if present" },
    { category: "Bathroom", label: "Descale showerhead" },
    { category: "Bathroom", label: "Clean grout in bathroom" },
    { category: "Bedroom", label: "Inspect mattress and rotate if needed" },
    { category: "General",  label: "Check behind TV and dust cables" },
    { category: "General",  label: "Inspect and clean AC/heating vents" },
    { category: "General",  label: "Window cleaning inside" },
    { category: "General",  label: "Full inventory check of minibar" },
  ];
  const deepCleanItems = [...standardCheckoutItems, ...deepCleanExtra];

  async function createTemplate(name, taskType, itemsSpec) {
    const tpl = await prisma.checklistTemplate.create({
      data: { name, taskType, propertyId: property.id },
    });
    await prisma.checklistItem.createMany({
      data: itemsSpec.map((it, idx) => ({
        templateId: tpl.id,
        label: it.label,
        category: it.category,
        order: idx,
      })),
    });
    return tpl;
  }

  const tplCheckout  = await createTemplate("Standard Checkout Clean", "CHECKOUT",   standardCheckoutItems);
  const tplStayOver  = await createTemplate("Stay-Over Service",       "STAY_OVER",  stayOverItems);
  const tplDeepClean = await createTemplate("Deep Clean",              "DEEP_CLEAN", deepCleanItems);

  const templatesByType = {
    CHECKOUT:   tplCheckout,
    STAY_OVER:  tplStayOver,
    DEEP_CLEAN: tplDeepClean,
  };

  console.log("  → housekeeping tasks + checklists (today, 20 rooms)");

  const roomByNumber = new Map(rooms.map((r) => [r.number, r]));

  // Assignment plan — Maria/James/Linda/Carlos/Aisha.
  const assignmentPlan = [
    { staff: maria, rooms: ["101", "102", "103", "104"] },
    { staff: james, rooms: ["105", "106", "107", "108"] },
    { staff: linda, rooms: ["201", "202", "203", "204"] },
    { staff: carlos, rooms: ["205", "206", "207", "208"] },
    { staff: aisha, rooms: ["301", "302", "303", "304"] },
  ];
  // Status mix across the 20 tasks — cover DONE, IN_PROGRESS, PENDING, INSPECTED.
  const statusCycle = [
    "DONE", "IN_PROGRESS", "PENDING", "INSPECTED",
    "PENDING", "IN_PROGRESS", "DONE", "PENDING",
    "INSPECTED", "PENDING", "IN_PROGRESS", "DONE",
    "PENDING", "INSPECTED", "PENDING", "IN_PROGRESS",
    "DONE", "PENDING", "INSPECTED", "PENDING",
  ];
  const taskTypeCycle = ["CHECKOUT", "STAY_OVER", "CHECKOUT", "DEEP_CLEAN"];

  const nowTs = new Date();
  function minutesAgo(m) {
    return new Date(nowTs.getTime() - m * 60 * 1000);
  }

  let cursor = 0;
  for (const plan of assignmentPlan) {
    for (const roomNumber of plan.rooms) {
      const room = roomByNumber.get(roomNumber);
      if (!room) continue;

      const status = statusCycle[cursor % statusCycle.length];
      const taskType = taskTypeCycle[cursor % taskTypeCycle.length];
      cursor += 1;

      const startedAt =
        status === "IN_PROGRESS" || status === "INSPECTED" || status === "DONE"
          ? minutesAgo(30 + cursor * 3)
          : null;
      const completedAt = status === "DONE" ? minutesAgo(cursor * 2) : null;

      // Flip room status to DIRTY for PENDING/IN_PROGRESS — makes the floor map feel alive.
      if (room.status === "VACANT" && (status === "PENDING" || status === "IN_PROGRESS")) {
        await prisma.room.update({
          where: { id: room.id },
          data: { status: "DIRTY" },
        });
      }
      if (status === "DONE" && room.status === "VACANT") {
        await prisma.room.update({
          where: { id: room.id },
          data: { status: "CLEAN" },
        });
      }

      const task = await prisma.housekeepingTask.create({
        data: {
          roomId: room.id,
          assignedToId: plan.staff.id,
          status,
          taskType,
          priority: (cursor % 5) + 1,
          notes: status === "INSPECTED" ? "Ready for inspection." : null,
          startedAt,
          completedAt,
        },
      });

      // Build the per-task checklist from the matching template.
      const tpl = templatesByType[taskType] ?? tplCheckout;
      const tplItems = await prisma.checklistItem.findMany({
        where: { templateId: tpl.id },
        orderBy: { order: "asc" },
      });

      const checklist = await prisma.roomChecklist.create({
        data: {
          taskId: task.id,
          completedAt: status === "DONE" ? completedAt : null,
        },
      });

      // Partial completion mirrors the task status.
      const totalItems = tplItems.length;
      let checkedCount;
      if (status === "DONE" || status === "INSPECTED") checkedCount = totalItems;
      else if (status === "IN_PROGRESS") checkedCount = Math.floor(totalItems * 0.5);
      else checkedCount = 0;

      const itemData = tplItems.map((it, idx) => ({
        checklistId: checklist.id,
        label: it.label,
        category: it.category,
        order: idx,
        isChecked: idx < checkedCount,
        checkedAt: idx < checkedCount ? minutesAgo(20 + idx) : null,
      }));
      if (itemData.length) {
        await prisma.roomChecklistItem.createMany({ data: itemData });
      }
    }
  }

  console.log("  → lost & found (4)");
  const lfSeed = [
    { roomNumber: "203", description: "Blue phone charger",          foundBy: "Linda Park",     daysAgo: 0 },
    { roomNumber: "106", description: "Child's stuffed animal",      foundBy: "James Okafor",   daysAgo: 2 },
    { roomNumber: "312", description: "Sunglasses (Ray-Ban)",        foundBy: "Aisha Williams", daysAgo: 1 },
    { roomNumber: "201", description: "Laptop sleeve",               foundBy: "Linda Park",     daysAgo: 0 },
  ];
  for (const lf of lfSeed) {
    const room = roomByNumber.get(lf.roomNumber);
    if (!room) continue;
    const foundAt = new Date(nowTs);
    foundAt.setDate(foundAt.getDate() - lf.daysAgo);
    await prisma.lostAndFound.create({
      data: {
        roomId: room.id,
        description: lf.description,
        foundBy: lf.foundBy,
        foundAt,
        status: "UNCLAIMED",
      },
    });
  }

  console.log("  → maintenance requests (3)");
  const maintSeed = [
    { roomNumber: "316", description: "Shower drain clogged",   severity: "HIGH",   reportedBy: "Aisha Williams" },
    { roomNumber: "204", description: "TV remote not working",  severity: "LOW",    reportedBy: "Linda Park" },
    { roomNumber: "108", description: "AC making loud noise",   severity: "MEDIUM", reportedBy: "James Okafor" },
  ];
  for (const m of maintSeed) {
    const room = roomByNumber.get(m.roomNumber);
    if (!room) continue;
    await prisma.maintenanceRequest.create({
      data: {
        roomId: room.id,
        reportedById: manager.id,
        reportedBy: m.reportedBy,
        description: m.description,
        severity: m.severity,
        status: "OPEN",
      },
    });
  }

  console.log("  → supply requests (2)");
  await prisma.supplyRequest.create({
    data: {
      requestedBy: "Maria Santos",
      items: "Queen size pillow cases",
      quantity: "20",
      urgency: "URGENT",
      status: "PENDING",
      notes: "Need more queen size pillow cases",
    },
  });
  await prisma.supplyRequest.create({
    data: {
      requestedBy: "Carlos Mendez",
      items: "Shampoo bottles",
      quantity: "50",
      urgency: "NORMAL",
      status: "PENDING",
      notes: "Running low on shampoo bottles",
    },
  });

  console.log("✅ Seed complete.");
  console.log(`   Admin: admin@meridian.com / password123`);
  console.log(`   Total: ${rooms.length} rooms, ${guests.length} guests, 15 reservations`);
  console.log(`   Housekeeping: ${housekeepers.length} staff, 20 tasks with checklists`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
