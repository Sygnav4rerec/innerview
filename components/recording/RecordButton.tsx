interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function RecordButton({ isRecording, isProcessing, disabled, onToggle }: RecordButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled || isProcessing}
      className={[
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isRecording ? "bg-red-600 text-white" : "bg-white/10 text-neutral-200 hover:bg-white/20",
        disabled || isProcessing ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? "animate-pulse bg-white" : "bg-red-500"}`} />
      {isProcessing ? "Processing…" : isRecording ? "Stop (R)" : "Record (R)"}
    </button>
  );
}
