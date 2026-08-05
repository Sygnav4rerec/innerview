import { create } from "zustand";

interface AppState {
  script: string;
  setScript: (script: string) => void;

  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  togglePlaying: () => void;

  targetWPM: number;
  setTargetWPM: (wpm: number) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;

  isCameraOn: boolean;
  setIsCameraOn: (on: boolean) => void;

  isRecording: boolean;
  setIsRecording: (on: boolean) => void;

  pipOpen: boolean;
  setPipOpen: (open: boolean) => void;
  pipUrl: string;
  setPipUrl: (url: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  script: "",
  setScript: (script) => set({ script }),

  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlaying: () => set((s) => ({ isPlaying: !s.isPlaying })),

  targetWPM: 155,
  setTargetWPM: (wpm) => set({ targetWPM: wpm }),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  isCameraOn: false,
  setIsCameraOn: (on) => set({ isCameraOn: on }),

  isRecording: false,
  setIsRecording: (on) => set({ isRecording: on }),

  pipOpen: false,
  setPipOpen: (open) => set({ pipOpen: open }),
  pipUrl: "",
  setPipUrl: (url) => set({ pipUrl: url }),
}));
