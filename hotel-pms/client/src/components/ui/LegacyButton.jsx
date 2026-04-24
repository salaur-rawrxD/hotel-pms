import clsx from "clsx";

const VARIANTS = {
  primary:
    "bg-teal text-white hover:bg-teal/90 border border-teal-700 shadow-sm",
  secondary:
    "bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700",
  gold:
    "bg-amber-500 text-slate-900 border border-amber-600 hover:bg-amber-400",
  ghost:
    "bg-transparent text-slate-200 border border-transparent hover:bg-slate-800",
  danger:
    "bg-rose-600 text-white border border-rose-700 hover:bg-rose-500",
};

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/** Front Desk / PMS default button (variant primary, gold, etc.) */
export default function LegacyButton({
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
        "focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2 focus:ring-offset-navy-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
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
