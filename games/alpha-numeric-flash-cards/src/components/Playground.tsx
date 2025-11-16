'use client';

import { CardMode } from "@/data/cards";
import { FlashCardDisplay } from "@/components/FlashCardDisplay";
import { ModeSelector } from "@/components/ModeSelector";
import { ParentTips } from "@/components/ParentTips";
import { ProgressDots } from "@/components/ProgressDots";
import { MicButton } from "@/components/MicButton";
import { useFlashDeck } from "@/hooks/useFlashDeck";
import { MicPhase, useMicSimulator } from "@/hooks/useMicSimulator";
import { useState } from "react";

export function Playground() {
  const [mode, setMode] = useState<CardMode>("numbers");
  const { currentCard, position, total, advance, reshuffle } = useFlashDeck(mode);
  const { phase, durationMs, start } = useMicSimulator();

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-4">
        <ModeSelector value={mode} onChange={(nextMode) => {
          setMode(nextMode);
          reshuffle();
        }} />
        <CaptureStatus phase={phase} durationMs={durationMs} />
        <ParentTips />
      </div>
      <div className="rounded-[44px] border border-white/60 bg-white/90 p-6 shadow-[0_30px_120px_rgba(151,173,203,0.45)]">
        <div className="flex flex-col gap-6">
          <FlashCardDisplay card={currentCard} />
          <ProgressDots index={position - 1} total={total} />
          <div className="flex flex-col gap-4 md:flex-row">
            <MicButton phase={phase} onPress={start} />
            <button
              type="button"
              onClick={advance}
              className="flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-[0_8px_40px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100"
            >
              Next card
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
            <span>Mic + Whisper integration arrives in Milestone 2.</span>
            <button
              type="button"
              onClick={reshuffle}
              className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-slate-700 shadow"
            >
              Reshuffle deck
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CaptureStatus({
  phase,
  durationMs,
}: {
  phase: MicPhase;
  durationMs: number;
}) {
  const durationSeconds = (durationMs / 1000).toFixed(1);
  const texts: Record<MicPhase, { title: string; helper: string }> = {
    idle: {
      title: "Mic idle",
      helper: "Tap the mint button to start listening.",
    },
    listening: {
      title: "Listening…",
      helper: "Keep speaking clearly and slowly.",
    },
    processing: {
      title: "Transcribing…",
      helper: "We are comparing your child’s answer.",
    },
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-[0_12px_60px_rgba(209,224,255,0.45)]">
      <p className="text-sm font-medium text-slate-500">{texts[phase].title}</p>
      <p className="text-2xl font-semibold text-slate-900">{durationSeconds}s</p>
      <p className="text-sm text-slate-500">{texts[phase].helper}</p>
    </div>
  );
}
