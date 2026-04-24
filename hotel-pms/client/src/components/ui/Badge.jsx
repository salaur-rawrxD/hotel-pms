import clsx from "clsx";

export default function Badge({ children, className, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-500/15 text-slate-300 border-slate-500/40",
    teal: "bg-teal/15 text-teal-light border-teal/40",
    gold: "bg-gold/15 text-gold-light border-gold/40",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone] ?? tones.slate,
        className,
      )}
    >
      {children}
    </span>
  );
}
