import clsx from "clsx";

const VARIANTS = {
  primary:
    "bg-teal hover:bg-teal-light text-white border border-teal-dark shadow-sm",
  secondary:
    "bg-navy-800 hover:bg-navy-700 text-slate-100 border border-navy-700",
  gold:
    "bg-gold hover:bg-gold-light text-navy-900 border border-gold",
  ghost:
    "bg-transparent hover:bg-navy-800 text-slate-200 border border-transparent",
  danger:
    "bg-rose-600 hover:bg-rose-500 text-white border border-rose-700",
};

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-teal-light focus:ring-offset-2 focus:ring-offset-navy-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{loading ? "Loading…" : children}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
