export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      const err = new Error("No token provided");
      err.status = 401;
      return next(err);
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      const err = new Error("Insufficient permissions");
      err.status = 403;
      return next(err);
    }

    next();
  };
