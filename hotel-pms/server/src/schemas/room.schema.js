import { z } from "zod";

export const roomStatusSchema = z.object({
  status: z.enum([
    "VACANT",
    "OCCUPIED",
    "DIRTY",
    "CLEAN",
    "OUT_OF_ORDER",
    "DUE_IN",
    "DUE_OUT",
  ]),
});
