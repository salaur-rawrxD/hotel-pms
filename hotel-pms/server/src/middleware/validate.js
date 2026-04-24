import { ZodError } from "zod";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const flat = error.flatten();
        const firstFieldMessage = Object.values(flat.fieldErrors)
          .flat()
          .find(Boolean);
        const err = new Error(
          firstFieldMessage ?? flat.formErrors?.[0] ?? "Validation failed",
        );
        err.status = 400;
        err.details = flat;
        return next(err);
      }
      next(error);
    }
  };
}
