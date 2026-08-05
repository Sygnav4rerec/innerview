interface ProgressBarProps {
  percent: number;
}

export function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full bg-white/70 transition-[width] duration-150 ease-linear"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
