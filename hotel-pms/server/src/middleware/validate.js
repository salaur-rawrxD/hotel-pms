import { ZodError } from "zod";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const err = new Error("Validation failed.");
        err.status = 422;
        err.details = error.flatten();
        return next(err);
      }
      next(error);
    }
  };
}
