import bcrypt from "bcryptjs";

import { prisma } from "../utils/prisma.js";
import { generateToken } from "../utils/generateToken.js";

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    throw err;
  }

  const token = generateToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    propertyId: user.propertyId,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      propertyId: user.propertyId,
    },
  });
}

export async function logout(_req, res) {
  // Tokens are stateless; clients should drop the token. Endpoint exists
  // so future blacklist/refresh-token work has a natural home.
  res.json({ success: true });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      propertyId: true,
    },
  });

  if (!user) {
    const err = new Error("User not found.");
    err.status = 404;
    throw err;
  }

  res.json(user);
}
