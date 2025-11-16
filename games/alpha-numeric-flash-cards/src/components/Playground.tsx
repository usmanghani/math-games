'use client';

import { CardMode, FlashCard } from "@/data/cards";
import { FlashCardDisplay } from "@/components/FlashCardDisplay";
import { ModeSelector } from "@/components/ModeSelector";
import { ParentTips } from "@/components/ParentTips";
import { ProgressDots } from "@/components/ProgressDots";
import { MicButton } from "@/components/MicButton";
import { AttemptHistory, Attempt, toAttempt } from "@/components/AttemptHistory";
import { useFlashDeck } from "@/hooks/useFlashDeck";
import { MicPermission, RecorderStatus, useMicRecorder } from "@/hooks/useMicRecorder";
import { transcribeAudio } from "@/lib/transcription";
import { validateAnswer, getExpectedAnswer } from "@/lib/validateAnswer";
import { useEffect, useState, useRef } from "react";

export function Playground() {
  const [mode, setMode] = useState<CardMode>("numbers");
  const { currentCard, position, total, advance, reshuffle } = useFlashDeck(mode);
  const recorder = useMicRecorder();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const cardForRecordingRef = useRef<FlashCard | null>(null);

  useEffect(() => {
    const recording = recorder.lastRecording;
    if (!recording || !cardForRecordingRef.current) return;

    const card = cardForRecordingRef.current;
    cardForRecordingRef.current = null; // Consume the ref

    // Create initial attempt with processing state
    const attempt: Attempt = {
      ...toAttempt(recording, { id: card.id, label: card.label }),
      isProcessing: true,
      transcription: undefined,
      isCorrect: undefined,
    };

    // Add attempt to list immediately
    const attemptId = attempt.id;
    setAttempts((prev) => [attempt, ...prev].slice(0, 5));

    // Start transcription process
    transcribeAndValidate(recording.blob, card, attemptId);
  }, [recorder.lastRecording]);

  // Transcribe audio and validate answer
  async function transcribeAndValidate(
    audioBlob: Blob,
    card: FlashCard,
    attemptId: string
  ) {
    try {
      // Call transcription API
      const transcription = await transcribeAudio(audioBlob);

      // Validate the answer
      const isCorrect = validateAnswer(transcription, card);
      const expectedAnswer = isCorrect ? undefined : getExpectedAnswer(card);

      // Update the attempt with results
      setAttempts((prev) =>
        prev.map((a) =>
          a.id === attemptId
            ? {
                ...a,
                isProcessing: false,
                transcription,
                isCorrect,
                expectedAnswer,
              }
            : a
        )
      );
    } catch (error) {
      console.error("Transcription failed:", error);

      // Update attempt with error
      setAttempts((prev) =>
        prev.map((a) =>
          a.id === attemptId
            ? {
                ...a,
                isProcessing: false,
                transcriptionError:
                  error instanceof Error ? error.message : "Transcription failed",
              }
            : a
        )
      );
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
      <div className="space-y-4">
        <ModeSelector value={mode} onChange={(nextMode) => {
          setMode(nextMode);
          reshuffle();
        }} />
        <CaptureStatus
          status={recorder.status}
          durationMs={recorder.durationMs}
          permission={recorder.permission}
        />
        <ParentTips />
      </div>
      <div className="rounded-[44px] border border-white/60 bg-white/90 p-6 shadow-[0_30px_120px_rgba(151,173,203,0.45)]">
        <div className="flex flex-col gap-6">
          <FlashCardDisplay card={currentCard} />
          <ProgressDots index={position - 1} total={total} />
          <div className="flex flex-col gap-4 md:flex-row">
            <MicButton
              status={recorder.status}
              permission={recorder.permission}
              isSupported={recorder.isSupported}
              onStart={() => {
                cardForRecordingRef.current = currentCard;
                recorder.startRecording();
              }}
              onStop={recorder.stopRecording}
            />
            <button
              type="button"
              onClick={advance}
              className="flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-[0_8px_40px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:border-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100"
            >
              Next card
            </button>
          </div>
          <AttemptHistory
            attempts={attempts}
            pending={recorder.status === "recording" || recorder.status === "stopping"}
            error={recorder.error}
            permission={recorder.permission}
          />
          <button
            type="button"
            onClick={reshuffle}
            className="self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow transition hover:-translate-y-0.5 hover:border-emerald-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          >
            Reshuffle deck
          </button>
        </div>
      </div>
    </section>
  );
}

function CaptureStatus({
  status,
  durationMs,
  permission,
}: {
  status: RecorderStatus;
  permission: MicPermission;
  durationMs: number;
}) {
  const durationSeconds = (durationMs / 1000).toFixed(1);
  const texts: Record<RecorderStatus, { title: string; helper: string }> = {
    idle: {
      title: "Mic idle",
      helper: "Tap the mint button to start listening.",
    },
    recording: {
      title: "Recording…",
      helper: "Keep speaking clearly and slowly.",
    },
    stopping: {
      title: "Transcribing…",
      helper: "We are comparing your child's answer.",
    },
  };

  const activeText = texts[status];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-[0_12px_60px_rgba(209,224,255,0.45)]">
      <p className="text-sm font-medium text-slate-500">{activeText.title}</p>
      <p className="text-2xl font-semibold text-slate-900">{durationSeconds}s</p>
      <p className="text-sm text-slate-500">{activeText.helper}</p>
      {permission === "denied" && (
        <p className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
          Microphone permissions are blocked. Please enable them and refresh the
          page.
        </p>
      )}
    </div>
  );
}
