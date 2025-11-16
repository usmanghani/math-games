'use client';

import { useCallback, useEffect, useRef, useState } from "react";

export type MicPhase = "idle" | "listening" | "processing";

export function useMicSimulator() {
  const [phase, setPhase] = useState<MicPhase>("idle");
  const [durationMs, setDurationMs] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    clearTimers();

    if (phase === "listening") {
      const startedAt = performance.now();
      tickRef.current = setInterval(() => {
        setDurationMs(Math.round(performance.now() - startedAt));
      }, 120);

      timeoutRef.current = setTimeout(() => {
        setPhase("processing");
        setDurationMs((prev) => (prev === 0 ? 2400 : prev));
      }, 2400);
    }

    if (phase === "processing") {
      timeoutRef.current = setTimeout(() => {
        setPhase("idle");
        setDurationMs(0);
      }, 1200);
    }

    return () => clearTimers();
  }, [phase]);

  const start = useCallback(() => {
    if (phase !== "idle") return;
    setDurationMs(0);
    setPhase("listening");
  }, [phase]);

  return { phase, durationMs, start };
}
