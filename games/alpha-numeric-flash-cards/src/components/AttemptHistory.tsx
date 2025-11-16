'use client';

import { RecordingResult } from "@/hooks/useMicRecorder";
import { formatDuration } from "@/utils/duration";

export interface Attempt {
  id: string;
  cardId: string;
  label: string;
  durationMs: number;
  createdAt: number;
  url: string;
}

interface AttemptHistoryProps {
  attempts: Attempt[];
  pending?: boolean;
  error?: string | null;
  permission: string;
}

export function AttemptHistory({
  attempts,
  pending,
  error,
  permission,
}: AttemptHistoryProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-[0_12px_60px_rgba(209,224,255,0.45)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Attempts
        </p>
        {pending && (
          <span className="text-xs font-semibold text-emerald-500">Saving…</span>
        )}
      </div>
      {permission === "denied" && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          Microphone blocked. Please enable it in your browser settings to keep
          practicing.
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {error}
        </p>
      )}
      {attempts.length === 0 ? (
        <p className="text-sm text-slate-500">
          Tap the mint button to record how you say the card. Attempts will
          appear here so a grown-up can replay the answers.
        </p>
      ) : (
        <ul className="space-y-3">
          {attempts.map((attempt) => (
            <li
              key={attempt.id}
              className="rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm shadow-[0_10px_25px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between text-slate-700">
                <div>
                  <p className="font-semibold">{attempt.label}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(attempt.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {formatDuration(attempt.durationMs)}
                </span>
              </div>
              <audio
                className="mt-2 w-full"
                controls
                src={attempt.url}
                preload="none"
                aria-label={`Playback attempt for ${attempt.label}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function toAttempt(
  recording: RecordingResult,
  card: { id: string; label: string },
): Attempt {
  return {
    id: `${recording.id}-${card.id}`,
    cardId: card.id,
    label: card.label,
    createdAt: recording.createdAt,
    durationMs: recording.durationMs,
    url: recording.url,
  };
}
