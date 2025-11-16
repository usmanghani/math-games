'use client';

import { MicPhase } from "@/hooks/useMicSimulator";
import { motion } from "framer-motion";

interface MicButtonProps {
  phase: MicPhase;
  onPress: () => void;
}

const LABELS: Record<MicPhase, string> = {
  idle: "Tap to speak",
  listening: "Listening…",
  processing: "Transcribing…",
};

export function MicButton({ phase, onPress }: MicButtonProps) {
  const busy = phase !== "idle";

  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: busy ? 1 : 0.96 }}
      disabled={busy}
      className={`relative flex min-h-[96px] flex-1 items-center justify-center gap-4 rounded-full px-6 py-4 text-lg font-semibold text-slate-900 shadow-[0_15px_45px_rgba(125,230,194,0.6)] transition hover:shadow-[0_25px_75px_rgba(125,230,194,0.75)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100 ${
        busy
          ? "bg-emerald-200/80 cursor-not-allowed"
          : "bg-gradient-to-r from-emerald-200 to-sky-200"
      }`}
    >
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-400">
        <MicIcon />
        {busy && (
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-100" />
        )}
      </span>
      <span>{LABELS[phase]}</span>
    </motion.button>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
    >
      <path d="M12 15.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v6a3.5 3.5 0 0 0 3.5 3.5Z" />
      <path d="M5.75 11.75a.75.75 0 0 0-1.5 0A7.752 7.752 0 0 0 11.25 19.5v1.75h-2a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-2V19.5a7.752 7.752 0 0 0 6.999-7.75.75.75 0 0 0-1.5 0 6.25 6.25 0 1 1-12.5 0Z" />
    </svg>
  );
}
