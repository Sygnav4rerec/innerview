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

  // true = mirrored ("looking in a mirror," the familiar/comfortable view).
  // false = true orientation — how the camera actually sees you, i.e. how
  // everyone else sees you. Toggling between the two over time is the point:
  // it's a deliberate self-perception exercise, not just a display setting.
  isMirrored: boolean;
  setIsMirrored: (mirrored: boolean) => void;
  toggleMirrored: () => void;

  isRecording: boolean;
  setIsRecording: (on: boolean) => void;

  pipOpen: boolean;
  setPipOpen: (open: boolean) => void;
  pipUrl: string;
  setPipUrl: (url: string) => void;

  // Independent of the camera's mirror toggle — flips the PiP reference
  // clip itself (useful for third-party material, e.g. educational videos,
  // where the user wants to view it laterally flipped). Just an option, no
  // claims attached to what it does for anyone.
  pipMirrored: boolean;
  togglePipMirrored: () => void;
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

  isMirrored: true,
  setIsMirrored: (mirrored) => set({ isMirrored: mirrored }),
  toggleMirrored: () => set((s) => ({ isMirrored: !s.isMirrored })),

  isRecording: false,
  setIsRecording: (on) => set({ isRecording: on }),

  pipOpen: false,
  setPipOpen: (open) => set({ pipOpen: open }),
  pipUrl: "",
  setPipUrl: (url) => set({ pipUrl: url }),

  pipMirrored: false,
  togglePipMirrored: () => set((s) => ({ pipMirrored: !s.pipMirrored })),
}));
