"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useSettings } from "@/components/SettingsProvider";

/**
 * Gentle on-load reveal. Honors BOTH the OS reduced-motion preference and
 * Aura's in-app "reduce motion" toggle — when either is set, content renders
 * instantly with no transform, so motion never works against the user.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const { settings } = useSettings();
  const reduce = prefersReduced || settings.motion === "reduced";

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
