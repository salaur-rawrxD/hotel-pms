import clsx from "clsx";

export default function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-md bg-navy-700/60",
        className,
      )}
    />
  );
}
