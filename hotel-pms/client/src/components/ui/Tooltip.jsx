import clsx from "clsx";
import { useState } from "react";

export default function Tooltip({ content, children, side = "top", className }) {
  const [open, setOpen] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span
      className={clsx("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && content && (
        <span
          role="tooltip"
          className={clsx(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-navy-700 bg-navy-900 px-2 py-1 text-xs text-slate-200 shadow-lg",
            positions[side],
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
