export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      const err = new Error("Not authenticated.");
      err.status = 401;
      return next(err);
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      const err = new Error("You do not have permission to access this resource.");
      err.status = 403;
      return next(err);
    }

    next();
  };
}
