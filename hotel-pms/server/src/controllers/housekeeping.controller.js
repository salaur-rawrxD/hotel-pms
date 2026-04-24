import { prisma } from "../utils/prisma.js";

export async function listTasks(req, res) {
  const { status, assignedToId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (assignedToId) where.assignedToId = assignedToId;

  const tasks = await prisma.housekeepingTask.findMany({
    where,
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    include: {
      room: { select: { id: true, number: true, floor: true, status: true } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  res.json(tasks);
}

export async function createTask(req, res) {
  const created = await prisma.housekeepingTask.create({
    data: req.body,
    include: {
      room: true,
      assignedTo: { select: { id: true, name: true } },
    },
  });
  res.status(201).json(created);
}

export async function updateTask(req, res) {
  const data = { ...req.body };
  if (data.status === "DONE" && !data.completedAt) {
    data.completedAt = new Date();
  }

  const updated = await prisma.housekeepingTask.update({
    where: { id: req.params.id },
    data,
    include: {
      room: true,
      assignedTo: { select: { id: true, name: true } },
    },
  });
  res.json(updated);
}
