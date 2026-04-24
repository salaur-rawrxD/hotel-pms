import clsx from "clsx";

export default function Card({ className, children, title, actions }) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-navy-700 bg-navy-800/60 backdrop-blur-sm shadow-sm",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between border-b border-navy-700 px-5 py-4">
          {title && (
            <h3 className="text-sm font-semibold tracking-wide text-slate-100">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
