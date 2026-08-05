interface WPMBadgeProps {
  currentWPM: number;
  targetWPM: number;
}

export function WPMBadge({ currentWPM, targetWPM }: WPMBadgeProps) {
  const delta = currentWPM - targetWPM;
  const status = Math.abs(delta) <= 8 ? "on pace" : delta > 0 ? "too fast" : "too slow";
  const color =
    status === "on pace" ? "text-emerald-400" : status === "too fast" ? "text-amber-400" : "text-sky-400";

  return (
    <div className="flex flex-col items-center rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur">
      <span className={`text-sm font-medium ${color}`}>{currentWPM} WPM</span>
      <span className="text-[10px] uppercase tracking-wide text-neutral-400">
        {status} · target {targetWPM}
      </span>
    </div>
  );
}
