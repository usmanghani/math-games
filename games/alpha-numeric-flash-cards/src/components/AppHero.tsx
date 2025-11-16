export function AppHero() {
  return (
    <header className="rounded-[40px] border border-white/60 bg-white/70 px-6 py-8 text-slate-900 shadow-[0_20px_90px_rgba(209,224,255,0.6)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">
        alpha numeric flash cards
      </p>
      <div className="mt-4 flex flex-wrap gap-6">
        <div className="max-w-3xl space-y-3">
          <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
            Friendly flash cards that listen, celebrate, and coach.
          </h1>
          <p className="text-lg text-slate-600">
            Built for three-year-olds who are learning to call numbers and
            letters out loud. Each tap reshuffles the deck, and a playful mic
            flow gets them ready for speech-to-text magic.
          </p>
        </div>
        <div className="flex flex-1 items-center justify-end gap-6 text-sm font-medium text-slate-500">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Modes
            </p>
            <p className="text-3xl font-semibold text-slate-900">3</p>
            <p>numbers, letters, mixed</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Ready for
            </p>
            <p className="text-3xl font-semibold text-slate-900">
              iPad &amp; Web
            </p>
            <p>touch friendly UI</p>
          </div>
        </div>
      </div>
    </header>
  );
}
