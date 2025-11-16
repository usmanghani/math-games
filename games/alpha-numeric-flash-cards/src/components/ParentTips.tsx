interface ParentTipsProps {
  items?: string[];
}

const DEFAULT_TIPS = [
  "Cheer for every try to reinforce effort.",
  "Use simple hints like “starts with the /b/ sound”.",
  "Mirror the answer so your child can hear it again.",
];

export function ParentTips({ items = DEFAULT_TIPS }: ParentTipsProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-rose-100 bg-white/90 p-4 shadow-[0_12px_60px_rgba(244,181,196,0.35)]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">
          Parent tips
        </p>
        <p className="text-base font-medium text-slate-800">
          Encourage confident speaking
        </p>
      </div>
      <ul className="space-y-2 text-sm text-slate-600">
        {items.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-rose-300" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
