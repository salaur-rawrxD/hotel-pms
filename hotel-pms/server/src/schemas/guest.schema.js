import { z } from "zod";

export const createGuestSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  nationality: z.string().max(100).optional(),
  idType: z.string().max(50).optional(),
  idNumber: z.string().max(100).optional(),
  loyaltyTier: z
    .enum(["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM"])
    .default("NONE"),
  loyaltyPoints: z.number().int().nonnegative().default(0),
  notes: z.string().max(2000).optional(),
});

export const updateGuestSchema = createGuestSchema.partial();
