'use client';

import { FlashCard } from "@/data/cards";
import { motion, AnimatePresence } from "framer-motion";

interface FlashCardDisplayProps {
  card: FlashCard;
}

export function FlashCardDisplay({ card }: FlashCardDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-[44px] border border-white/70 bg-gradient-to-b from-white to-rose-50/50 p-6 shadow-[0_28px_120px_rgba(196,199,216,0.55)]">
      <div className="pointer-events-none absolute inset-x-6 inset-y-10 rounded-[36px] border border-white/60" />
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -25, scale: 0.98 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative flex flex-col items-center gap-6 py-6"
        >
          <span
            className="rounded-full px-4 py-1 text-sm font-semibold text-slate-600"
            style={{ backgroundColor: `${card.color}33` }}
          >
            {card.label}
          </span>
          <span
            className="font-display text-[clamp(5rem,12vw,12rem)] leading-none text-slate-900"
            style={{ color: card.color }}
          >
            {card.display}
          </span>
          <p className="rounded-full border border-dashed border-rose-200/70 px-4 py-2 text-sm text-slate-500">
            {card.hint}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
