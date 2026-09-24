"use client";

import { useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";
import { resolveEmbed } from "@/lib/embed";

interface PiPWindowProps {
  url: string;
  onUrlChange: (url: string) => void;
  onClose: () => void;
  /** Flips the loaded clip horizontally — independent of the camera's own
   * mirror toggle. Just an option; no claims about what it does for anyone. */
  mirrored: boolean;
  onToggleMirror: () => void;
}

/**
 * Floating, draggable, resizable reference-video window. Toggled on/off
 * (not always present). Drag the header to move it; drag the native
 * browser resize grip in the bottom-right corner (CSS `resize: both` +
 * `overflow: auto`) to make it as big or small as the user wants — the
 * embedded content fills whatever size the window is resized to.
 *
 * Accepts YouTube, Loom, Zoom, or Slack links for playback reference only —
 * no download of third-party video is offered here; the user's own
 * rehearsal recording downloads separately as MP4 (see useRecorder).
 */
export function PiPWindow({ url, onUrlChange, onClose, mirrored, onToggleMirror }: PiPWindowProps) {
  const { position, dragHandleProps } = useDraggable({ x: 32, y: 32 });
  const [draft, setDraft] = useState(url);
  const [videoFailed, setVideoFailed] = useState(false);

  const { platform, kind, embedUrl } = resolveEmbed(url);
  const showSlackGuidance = platform === "slack" && kind === "unsupported";
  const hasPlayableContent = Boolean(embedUrl) && !videoFailed;

  const changeLink = () => {
    setDraft("");
    setVideoFailed(false);
    onUrlChange("");
  };

  return (
    <div
      className="absolute z-30 flex h-64 w-80 min-h-[160px] min-w-[220px] max-h-[80vh] max-w-[90vw] resize flex-col overflow-auto rounded-xl border border-white/10 bg-neutral-950 shadow-2xl"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex shrink-0 cursor-grab items-center justify-between bg-white/5 px-3 py-2 active:cursor-grabbing"
        {...dragHandleProps}
      >
        <span className="text-xs font-medium text-neutral-300">Reference video</span>
        <div className="flex items-center gap-3">
          {hasPlayableContent && (
            <button
              onClick={onToggleMirror}
              onPointerDown={(e) => e.stopPropagation()}
              className={mirrored ? "text-white" : "text-neutral-400 hover:text-white"}
              aria-label={mirrored ? "Unflip reference video" : "Flip reference video horizontally"}
              title="Flip horizontally"
            >
              ⇄
            </button>
          )}
          <button
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-neutral-400 hover:text-white"
            aria-label="Close reference video"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-3">
        {embedUrl && !videoFailed ? (
          <div className="flex h-full flex-col gap-2">
            <div className="min-h-0 flex-1 overflow-hidden rounded-md bg-black">
              {kind === "video" ? (
                <video
                  src={embedUrl}
                  controls
                  className={["h-full w-full object-contain", mirrored ? "scale-x-[-1]" : ""].join(" ")}
                  onError={() => setVideoFailed(true)}
                />
              ) : (
                <iframe
                  src={embedUrl}
                  className={["h-full w-full", mirrored ? "scale-x-[-1]" : ""].join(" ")}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <button onClick={changeLink} className="shrink-0 self-start text-[10px] text-neutral-500 hover:text-neutral-300">
              Change link ({platform})
            </button>
          </div>
        ) : showSlackGuidance || videoFailed ? (
          <div className="flex h-full flex-col justify-between gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-neutral-300">
                {videoFailed
                  ? "That link didn't play — it may need public sharing enabled, or the link has expired."
                  : "Slack channel/message links can't be embedded directly — Slack requires being signed in and blocks framing its own pages."}
              </p>
              <p className="text-[10px] text-neutral-500">
                In Slack, open the video clip, then <span className="text-neutral-300">More actions → Create external link</span>{" "}
                on the file itself, and paste that link here instead.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {draft && (
                <a
                  href={draft}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-white/10 px-2 py-1.5 text-xs text-white hover:bg-white/20"
                >
                  Open in Slack ↗
                </a>
              )}
              <button onClick={changeLink} className="rounded-md bg-white/10 px-2 py-1.5 text-xs text-white hover:bg-white/20">
                Try another link
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onUrlChange(draft);
            }}
            className="flex flex-col gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste a YouTube, Loom, Zoom, or Slack video link"
              className="w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-white/30"
            />
            <button type="submit" className="rounded-md bg-white/10 px-2 py-1.5 text-xs text-white hover:bg-white/20">
              Load
            </button>
            <p className="text-[10px] text-neutral-500">
              Playback for reference only — downloading third-party video isn&apos;t supported. Your own
              rehearsal recording downloads separately as MP4. For Slack, use a file&apos;s
              &quot;Create external link&quot; — plain channel links can&apos;t be embedded.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
