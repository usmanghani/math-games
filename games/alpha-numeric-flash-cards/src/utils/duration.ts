export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0.0s";
  const seconds = ms / 1000;
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toFixed(1).padStart(4, "0")}`;
  }
  return `${seconds.toFixed(1)}s`;
}

export function clampMs(ms: number, max: number): number {
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.min(ms, max);
}
