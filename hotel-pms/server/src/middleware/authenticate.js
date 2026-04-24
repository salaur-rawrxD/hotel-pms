import { verifyToken } from "../utils/generateToken.js";

export function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (!token || scheme !== "Bearer") {
    const err = new Error("Missing or malformed Authorization header.");
    err.status = 401;
    return next(err);
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      propertyId: payload.propertyId ?? null,
    };
    next();
  } catch (_error) {
    const err = new Error("Invalid or expired token.");
    err.status = 401;
    next(err);
  }
}
