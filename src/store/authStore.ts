import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

export type AuthStatus = "loading" | "authenticated" | "denied" | "signed-out";

interface AuthState {
  session: Session | null;
  email: string | null;
  status: AuthStatus;
  setSession: (s: Session | null) => void;
  setStatus: (s: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  email: null,
  status: "loading",
  setSession: (session) =>
    set({ session, email: session?.user.email ?? null }),
  setStatus: (status) => set({ status }),
}));
