import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Animates a number from `from` up to `to` over `duration` ms using
 * requestAnimationFrame. Re-runs whenever `to` changes.
 */
export function useCountUp(to, { duration = 800, from = 0 } = {}) {
  const [value, setValue] = useState(from);
  const frameRef = useRef(0);
  const startRef = useRef(0);
  const fromRef = useRef(from);

  useEffect(() => {
    const target = Number(to) || 0;

    if (!Number.isFinite(target)) {
      setValue(target);
      return undefined;
    }

    fromRef.current = value;
    startRef.current = 0;

    const tick = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setValue(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration]);

  return value;
}
