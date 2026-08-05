"use client";

import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const FFMPEG_CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "video/mp4", // Safari records native MP4 — no transcode needed
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export interface UseRecorderResult {
  isRecording: boolean;
  isProcessing: boolean;
  downloadUrl: string | null;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * Records the camera stream via MediaRecorder. Safari natively records MP4;
 * everywhere else records WebM and transcodes to MP4 client-side with
 * ffmpeg.wasm so the export is always a downloadable .mp4, never .webm.
 */
export function useRecorder(stream: MediaStream | null): UseRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const transcodeToMp4 = useCallback(async (blob: Blob) => {
    setIsProcessing(true);
    try {
      if (!ffmpegRef.current) {
        const ffmpeg = new FFmpeg();
        await ffmpeg.load({
          coreURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffmpegRef.current = ffmpeg;
      }
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile("input.webm", await fetchFile(blob));
      await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-preset", "fast", "-c:a", "aac", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const mp4Blob = new Blob([data as BlobPart], { type: "video/mp4" });
      setDownloadUrl(URL.createObjectURL(mp4Blob));
    } catch {
      setError("MP4 conversion failed — recording is available as WebM instead.");
      setDownloadUrl(URL.createObjectURL(blob));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleStop = useCallback(() => {
    const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || "video/webm" });
    setIsRecording(false);

    if (mimeTypeRef.current.startsWith("video/mp4")) {
      setDownloadUrl(URL.createObjectURL(blob));
      return;
    }

    void transcodeToMp4(blob);
  }, [transcodeToMp4]);

  const start = useCallback(() => {
    if (!stream) {
      setError("Camera is not active");
      return;
    }
    setError(null);
    setDownloadUrl(null);
    chunksRef.current = [];

    const mimeType = pickMimeType();
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = handleStop;
    recorder.start();

    recorderRef.current = recorder;
    setIsRecording(true);
  }, [stream, handleStop]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  return { isRecording, isProcessing, downloadUrl, error, start, stop };
}
