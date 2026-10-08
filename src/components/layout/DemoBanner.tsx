'use client';

export function DemoBanner() {
  return (
    <div
      role="status"
      className="bg-amber-500 text-amber-950 font-semibold px-4 py-1.5 text-xs flex items-center justify-between border-b border-amber-600 shadow-sm"
    >
      <div className="flex items-center gap-2 mx-auto">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-900 animate-pulse" />
        <span className="font-bold tracking-wide uppercase">Demo data</span>
        <span className="hidden sm:inline font-normal text-amber-900">
          — Fictional companies and illustrative transactions. Never real market data.
        </span>
      </div>
    </div>
  );
}
