import { z } from "zod";

export const createTaskSchema = z.object({
  roomId: z.string().min(1),
  assignedToId: z.string().optional(),
  priority: z.number().int().min(1).max(5).default(3),
  notes: z.string().max(1000).optional(),
});

export const updateTaskSchema = z.object({
  status: z
    .enum(["PENDING", "IN_PROGRESS", "INSPECTED", "DONE"])
    .optional(),
  assignedToId: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
});
