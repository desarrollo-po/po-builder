import { useEffect, type ReactNode } from "react";
import { supabase, isEmailAllowed, signOutAll } from "../../lib/supabase";
import { useAuthStore } from "../../store/authStore";
import LoginScreen from "./LoginScreen";

export default function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const email = useAuthStore((s) => s.email);
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;

    const handle = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (cancelled) return;
      if (!session) {
        setSession(null);
        setStatus("signed-out");
        return;
      }
      const ok = await isEmailAllowed(session.user.email!);
      if (cancelled) return;
      if (!ok) {
        await signOutAll();
        setSession(null);
        setStatus("denied");
        return;
      }
      setSession(session);
      setStatus("authenticated");
    };

    supabase.auth.getSession().then(({ data }) => handle(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      handle(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [setSession, setStatus]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando…</p>
      </div>
    );
  }

  if (status === "signed-out") return <LoginScreen />;

  if (status === "denied") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-xl font-semibold">Acceso denegado</h1>
        <p className="max-w-md text-sm text-gray-600">
          La cuenta {email ?? "que usaste"} no está autorizada para usar PO Builder.
          Pedí que te agreguen a la lista de editores.
        </p>
        <button
          onClick={() => setStatus("signed-out")}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
