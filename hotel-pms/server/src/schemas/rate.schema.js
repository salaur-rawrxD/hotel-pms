import { z } from "zod";

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Expected an ISO date string.");

export const bulkUpsertRatesSchema = z.object({
  roomTypeId: z.string().min(1),
  entries: z
    .array(
      z.object({
        date: isoDate,
        rate: z.number().nonnegative(),
        minLOS: z.number().int().positive().default(1),
        maxLOS: z.number().int().positive().default(30),
        closedToArrival: z.boolean().default(false),
        closedToDeparture: z.boolean().default(false),
        isBlocked: z.boolean().default(false),
      }),
    )
    .min(1),
});

export const createRatePlanSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  baseRate: z.number().nonnegative(),
  isRefundable: z.boolean().default(true),
  breakfastIncluded: z.boolean().default(false),
  propertyId: z.string().min(1),
});
