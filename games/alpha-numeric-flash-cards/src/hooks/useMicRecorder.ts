'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "stopping";

export type MicPermission = "unknown" | "granted" | "denied" | "unsupported";

export interface RecordingResult {
  id: string;
  blob: Blob;
  url: string;
  durationMs: number;
  createdAt: number;
  mimeType: string;
}

export interface UseMicRecorderOptions {
  maxDurationMs?: number;
  mimeType?: string;
}

const DEFAULT_MAX_DURATION = 4000;
const DEFAULT_MIME_TYPE = "audio/webm";

export function useMicRecorder(options: UseMicRecorderOptions = {}) {
  const { maxDurationMs = DEFAULT_MAX_DURATION, mimeType = DEFAULT_MIME_TYPE } =
    options;

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [permission, setPermission] = useState<MicPermission>("unknown");
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [lastRecording, setLastRecording] = useState<RecordingResult | null>(
    null,
  );

  const support = useMemo(() => {
    if (typeof window === "undefined") return false;
    const hasMediaDevices = "mediaDevices" in navigator;
    const hasGetUserMedia =
      typeof navigator.mediaDevices?.getUserMedia === "function";
    const hasMediaRecorder = typeof window.MediaRecorder !== "undefined";
    return hasMediaDevices && hasGetUserMedia && hasMediaRecorder;
  }, []);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  // Store event listener refs so we can properly remove them
  const onDataAvailableRef = useRef<((event: BlobEvent) => void) | null>(null);
  const onErrorRef = useRef<((event: Event) => void) | null>(null);
  const onStopRef = useRef<(() => void) | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    // Properly remove event listeners using stored refs
    if (recorderRef.current) {
      if (onDataAvailableRef.current) {
        recorderRef.current.removeEventListener("dataavailable", onDataAvailableRef.current);
      }
      if (onStopRef.current) {
        recorderRef.current.removeEventListener("stop", onStopRef.current);
      }
      if (onErrorRef.current) {
        recorderRef.current.removeEventListener("error", onErrorRef.current);
      }
      recorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    clearTimers();
    startedAtRef.current = null;
    setDurationMs(0);
  }, [clearTimers]);

  useEffect(() => cleanupStream, [cleanupStream]);

  const requestStream = useCallback(async () => {
    if (!support) {
      setPermission("unsupported");
      throw new Error("Microphone access is not supported.");
    }

    if (permission === "granted" && mediaStreamRef.current) {
      return mediaStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setPermission("granted");
      setError(null);
      return stream;
    } catch (err) {
      console.error("Mic permission denied", err);
      setPermission("denied");
      const message =
        err instanceof Error ? err.message : "Unable to access microphone.";
      setError(message);
      throw err;
    }
  }, [permission, support]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      setStatus("stopping");
      recorderRef.current.stop();
    }
  }, []);

  const resetLastRecording = useCallback(() => {
    // Don't revoke URL here - let it persist for playback in AttemptHistory
    // URLs will be cleaned up when the component unmounts
    setLastRecording(null);
  }, []);

  const startRecording = useCallback(async () => {
    // Guard against starting in any non-idle state
    if (status !== "idle") {
      return;
    }
    resetLastRecording();
    setError(null);

    try {
      const stream = await requestStream();
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      // Store event listeners in refs for proper cleanup
      onDataAvailableRef.current = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      onErrorRef.current = (event) => {
        console.error("MediaRecorder error", event);
        setError(
          (event as unknown as ErrorEvent)?.error?.message ??
            "Mic recorder error.",
        );
        setStatus("idle");
        cleanupStream();
      };

      onStopRef.current = () => {
        clearTimers();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];
        const url = URL.createObjectURL(blob);

        const finalDuration =
          startedAtRef.current !== null
            ? Math.round(performance.now() - startedAtRef.current)
            : 0;

        setDurationMs(finalDuration);
        setLastRecording({
          id: typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
          blob,
          url,
          durationMs: finalDuration,
          createdAt: Date.now(),
          mimeType: recorder.mimeType,
        });
        setStatus("idle");
        cleanupStream();
      };

      recorder.addEventListener("dataavailable", onDataAvailableRef.current);
      recorder.addEventListener("error", onErrorRef.current);
      recorder.addEventListener("stop", onStopRef.current);

      recorder.start();
      setStatus("recording");
      startedAtRef.current =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      setDurationMs(0);

      timerRef.current = setInterval(() => {
        if (startedAtRef.current === null) return;
        const elapsed =
          typeof performance !== "undefined"
            ? Math.round(performance.now() - startedAtRef.current)
            : Math.round(Date.now() - startedAtRef.current);
        setDurationMs(elapsed);
      }, 120);

      timeoutRef.current = setTimeout(() => {
        stopRecording();
      }, maxDurationMs);
    } catch (err) {
      console.error("Failed to start recording", err);
      cleanupStream();
    }
  }, [
    clearTimers,
    cleanupStream,
    maxDurationMs,
    mimeType,
    requestStream,
    resetLastRecording,
    status,
    stopRecording,
  ]);

  return {
    status,
    permission: support ? permission : "unsupported",
    error,
    durationMs,
    lastRecording,
    startRecording,
    stopRecording,
    resetLastRecording,
    isSupported: support,
  };
}
