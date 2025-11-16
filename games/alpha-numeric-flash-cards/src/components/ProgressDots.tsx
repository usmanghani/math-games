interface ProgressDotsProps {
  index: number;
  total: number;
}

export function ProgressDots({ index, total }: ProgressDotsProps) {
  const progressPercent = Math.round(((index + 1) / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Card {index + 1} / {total}
        </span>
        <span>{progressPercent}% of deck</span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/80">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-amber-300 via-pink-300 to-sky-300 transition-[width]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
