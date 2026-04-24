import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../utils/prisma.js";

function signAuthToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      propertyId: user.propertyId,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" },
  );
}

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    propertyId: user.propertyId,
    property: user.property
      ? { name: user.property.name, timezone: user.property.timezone }
      : null,
  };
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { property: { select: { name: true, timezone: true } } },
  });

  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = signAuthToken(user);

  res.status(200).json({
    token,
    user: serializeUser(user),
  });
}

export async function logout(_req, res) {
  res.status(200).json({ message: "Logged out successfully" });
}

export async function me(req, res) {
  const userId = req.user?.userId ?? req.user?.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { property: { select: { name: true, timezone: true } } },
  });

  if (!user) {
    const err = new Error("User no longer exists");
    err.status = 401;
    throw err;
  }

  res.status(200).json({ user: serializeUser(user) });
}
