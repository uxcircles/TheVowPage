import { useEffect, useState } from "react";

/** True on devices with a real mouse (hover + precise pointer), false on
 * touch-primary devices - lets a component offer a mouse-only interaction
 * (drag-and-drop, hover-to-reveal) instead of forcing a touch fallback
 * everywhere. */
export function useHasFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasFinePointer(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);
  return hasFinePointer;
}
