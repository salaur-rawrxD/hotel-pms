import { forwardRef } from "react";
import clsx from "clsx";

const Select = forwardRef(function Select(
  { label, hint, error, className, id, children, ...props },
  ref,
) {
  const selectId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          "h-10 rounded-md border bg-navy-900/60 px-3 text-sm text-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-teal-light focus:border-teal-light",
          error
            ? "border-rose-500/60"
            : "border-navy-700 hover:border-navy-600",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <span className="text-xs text-slate-500">{hint}</span>
      )}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
});

export default Select;
