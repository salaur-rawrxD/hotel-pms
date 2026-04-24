import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

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
  await prisma.folioItem.deleteMany();
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
    { email: "admin@meridian.com",         name: "Alex Rivera",   role: "ADMIN" },
    { email: "manager@meridian.com",       name: "Jordan Pierce", role: "MANAGER" },
    { email: "frontdesk1@meridian.com",    name: "Maya Chen",     role: "FRONT_DESK" },
    { email: "frontdesk2@meridian.com",    name: "Kai Patel",     role: "FRONT_DESK" },
    { email: "housekeeping1@meridian.com", name: "Rosa Alvarez",  role: "HOUSEKEEPING" },
    { email: "housekeeping2@meridian.com", name: "Tomás Silva",   role: "HOUSEKEEPING" },
  ];

  const users = [];
  for (const u of userSeed) {
    users.push(
      await prisma.user.create({
        data: { ...u, passwordHash, propertyId: property.id },
      }),
    );
  }
  const [admin, manager, fd1, fd2, hk1, hk2] = users;

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
    { guest: 9, nightsAgo: 1, nights: 3, status: "CHECKED_IN", source: "CORPORATE", roomIdx: 20 },
    { guest: 7, nightsAgo: 2, nights: 4, status: "CHECKED_IN", source: "DIRECT",    roomIdx: 31 },
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

    await prisma.reservation.create({
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
        depositPaid: spec.status === "CHECKED_IN" ? Number((total * 0.3).toFixed(2)) : 0,
        specialRequests:
          i % 3 === 0 ? "High floor if possible." : null,
      },
    });

    if (room && spec.status === "CHECKED_IN") {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: "OCCUPIED", currentGuestId: guest.id },
      });
    }
  }

  console.log("  → housekeeping tasks (8)");
  const taskRooms = [rooms[0], rooms[3], rooms[7], rooms[11], rooms[15], rooms[22], rooms[30], rooms[42]];
  const taskStatuses = ["PENDING", "PENDING", "IN_PROGRESS", "IN_PROGRESS", "INSPECTED", "DONE", "PENDING", "IN_PROGRESS"];
  const assignees = [hk1, hk2, hk1, hk2, hk1, hk2, hk1, hk2];
  for (let i = 0; i < taskRooms.length; i++) {
    await prisma.housekeepingTask.create({
      data: {
        roomId: taskRooms[i].id,
        assignedToId: assignees[i].id,
        status: taskStatuses[i],
        priority: (i % 5) + 1,
        notes: i % 2 === 0 ? "Standard turnover." : "Deep clean requested.",
        completedAt: taskStatuses[i] === "DONE" ? new Date() : null,
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log(`   Admin: admin@meridian.com / password123`);
  console.log(`   Total: ${rooms.length} rooms, ${guests.length} guests, 15 reservations`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
