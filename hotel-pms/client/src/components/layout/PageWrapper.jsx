import clsx from "clsx";

/**
 * Standard page container with optional title, description, and header actions.
 */
export default function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
}) {
  return (
    <div
      className={clsx("page-content mx-auto w-full max-w-[1400px] space-y-6", className)}
    >
      {(title != null || description != null || actions != null) && (
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            {title != null && (
              <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
                {title}
              </h1>
            )}
            {description != null && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}
          </div>
          {actions != null && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      )}

      <div className="space-y-6">{children}</div>
    </div>
  );
}
