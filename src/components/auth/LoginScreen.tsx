import { useState } from "react";
import { signInWithGoogle } from "../../lib/supabase";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // En el caso success, el browser navega a Google y vuelve al callback.
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)] px-4">
      <div className="flex w-[320px] max-w-full flex-col items-center gap-6 rounded-xl border border-surface-inset bg-white p-6 shadow-sm">
        <img
          src="/favicon-32x32.png"
          alt="Prensa Obrera"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <div className="text-center">
          <h1 className="text-base font-semibold text-black">PO Builder</h1>
          <p className="mt-1 text-xs text-text-tertiary">
            Home Builder | PrensaObrera.com
          </p>
        </div>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-text-muted bg-white px-4 py-2 text-sm font-medium text-black transition enabled:hover:bg-surface-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.47 1.18 4.95l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
          </svg>
          {loading ? "Conectando…" : "Entrar con Google"}
        </button>
        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
