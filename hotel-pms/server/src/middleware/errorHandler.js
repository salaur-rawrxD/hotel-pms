export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

// Express recognizes this as an error-handler because it has 4 args.
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error("[server error]", err);
  }

  res.status(status).json({
    message: err.message || "Internal server error.",
    ...(err.details ? { details: err.details } : {}),
  });
}
