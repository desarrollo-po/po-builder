import { create } from "zustand";

export interface ArmedContent {
  type: "article" | "banner" | "code";
  label: string;
  data: Record<string, unknown>;
}

interface TapPlaceState {
  armed: ArmedContent | null;
  arm: (armed: ArmedContent) => void;
  disarm: () => void;
  // Which panel the mobile shell shows — lives here (not local state in
  // App.tsx) so arming from deep inside the Sidebar can jump straight to
  // the canvas without prop-drilling a setter down through every source.
  mobileView: "contenido" | "pagina";
  setMobileView: (view: "contenido" | "pagina") => void;
}

export const useTapPlaceStore = create<TapPlaceState>((set) => ({
  armed: null,
  arm: (armed) => set({ armed, mobileView: "pagina" }),
  disarm: () => set({ armed: null }),
  mobileView: "pagina",
  setMobileView: (mobileView) => set({ mobileView }),
}));
