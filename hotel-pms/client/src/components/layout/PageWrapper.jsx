import clsx from "clsx";

export default function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
}) {
  return (
    <div className={clsx("mx-auto w-full max-w-[1400px] space-y-6", className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            {title && (
              <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="space-y-6">{children}</div>
    </div>
  );
}
