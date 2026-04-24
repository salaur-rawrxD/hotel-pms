import jwt from "jsonwebtoken";

export function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (!token || scheme !== "Bearer") {
    const err = new Error("No token provided");
    err.status = 401;
    return next(err);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      ...payload,
      id: payload.userId ?? payload.sub ?? payload.id,
      email: payload.email,
      name: payload.name ?? "Staff",
      role: payload.role,
      propertyId: payload.propertyId ?? null,
    };
    next();
  } catch (_error) {
    const err = new Error("Invalid or expired token");
    err.status = 401;
    next(err);
  }
}
