'use client';

import { CardMode } from "@/data/cards";
import { motion } from "framer-motion";

const MODES: Array<{
  id: CardMode;
  label: string;
  helper: string;
  accent: string;
}> = [
  {
    id: "numbers",
    label: "Numbers",
    helper: "0 – 20 with dot helpers",
    accent: "from-amber-200 to-orange-300",
  },
  {
    id: "letters",
    label: "Letters",
    helper: "A – Z uppercase pals",
    accent: "from-pink-200 to-rose-200",
  },
  {
    id: "mixed",
    label: "Mixed Magic",
    helper: "Surprise letters + numbers",
    accent: "from-sky-200 to-emerald-200",
  },
];

interface ModeSelectorProps {
  value: CardMode;
  onChange: (mode: CardMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_12px_60px_rgba(196,199,216,0.35)] backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        Choose a mode
      </p>
      <div className="grid gap-3">
        {MODES.map((mode) => {
          const active = mode.id === value;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-left transition hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/60"
            >
              <motion.span
                layoutId="mode-pill"
                transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
                className={`absolute inset-0 rounded-2xl opacity-0 transition ${mode.accent}`}
                style={{
                  opacity: active ? 0.75 : 0,
                }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800">
                    {mode.label}
                  </p>
                  <p className="text-sm text-slate-500">{mode.helper}</p>
                </div>
                <span
                  className={`text-sm font-semibold uppercase tracking-wider ${
                    active ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {active ? "Active" : "Tap"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
