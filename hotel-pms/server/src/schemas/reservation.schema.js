import { z } from "zod";

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Expected an ISO date string.");

export const createReservationSchema = z
  .object({
    guestId: z.string().min(1),
    roomId: z.string().min(1).optional(),
    roomTypeId: z.string().min(1),
    checkIn: isoDate,
    checkOut: isoDate,
    adults: z.number().int().min(1).default(1),
    children: z.number().int().min(0).default(0),
    source: z
      .enum(["DIRECT", "EXPEDIA", "BOOKING", "AIRBNB", "CORPORATE", "WALKIN"])
      .default("DIRECT"),
    ratePlanId: z.string().optional(),
    totalAmount: z.number().nonnegative(),
    depositPaid: z.number().nonnegative().default(0),
    specialRequests: z.string().max(2000).optional(),
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: "checkOut must be after checkIn.",
    path: ["checkOut"],
  });

export const updateReservationSchema = createReservationSchema
  .innerType()
  .partial()
  .extend({
    status: z
      .enum([
        "CONFIRMED",
        "CHECKED_IN",
        "CHECKED_OUT",
        "CANCELLED",
        "NO_SHOW",
      ])
      .optional(),
  });
