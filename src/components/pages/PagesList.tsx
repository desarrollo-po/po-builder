import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLocks, listPages, signOutAll, type PageLock } from "../../lib/supabase";
import { displayName } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import CreatePageModal from "./CreatePageModal";
import favicon from "../../assets/favicon-32x32.png";

export default function PagesList() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const authStatus = useAuthStore((s) => s.status);
  const [showCreate, setShowCreate] = useState(false);
  const [kickedMessage, setKickedMessage] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const kicked = sessionStorage.getItem("po-kicked");
    if (kicked) {
      sessionStorage.removeItem("po-kicked");
      const [by, sl] = kicked.split("|");
      setKickedMessage(`${displayName(by)} tomó el control de "${sl}". Tu borrador local sigue disponible.`);
    }
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["pages-and-locks"],
    queryFn: async () => {
      const [rows, lockData] = await Promise.all([listPages(), getLocks()]);
      return {
        pages: rows,
        locks: new Map((lockData as PageLock[]).map((l) => [l.slug, l.locked_by])),
      };
    },
    enabled: authStatus === "authenticated",
  });

  const pages = data?.pages ?? [];
  const locks = data?.locks ?? new Map<string, string>();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-inset bg-white px-6">
        <div className="flex items-center gap-3">
          <img
            src={favicon}
            alt="Prensa Obrera"
            width={28}
            height={28}
            className="shrink-0 rounded-lg object-contain"
          />
          <div className="flex flex-col gap-px">
            <span className="text-sm font-semibold tracking-[-0.2px] text-black">
              PO Builder — Páginas
            </span>
            <span className="text-[11px] font-normal text-text-tertiary">
              PrensaObrera.com
            </span>
          </div>
        </div>
        {email && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              title={email}
              className="flex h-7 items-center gap-1.5 rounded-md border border-surface-inset bg-white pl-1.5 pr-2 hover:bg-surface-accent"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-accent text-[10px] font-semibold text-text-secondary">
                {email[0].toUpperCase()}
              </span>
              <span className="pointer-events-none flex items-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-surface-inset bg-white py-1 shadow-md">
                <div className="truncate px-3 py-2 text-[11px] text-text-tertiary">{email}</div>
                <div className="mx-1 h-px bg-surface-inset" />
                <button
                  onClick={() => signOutAll()}
                  className="w-full rounded-none border-none bg-transparent px-3 py-2 text-left text-[12px] font-normal text-text-secondary hover:bg-surface-accent"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 px-6 py-8">
        {kickedMessage && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            <span>{kickedMessage}</span>
            <button onClick={() => setKickedMessage(null)} className="shrink-0 text-amber-600 hover:text-amber-800">✕</button>
          </div>
        )}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-text-primary">Páginas</h1>
            <p className="m-0 mt-1 text-[13px] text-text-secondary">
              Cada página se publica en <code>prensaobrera.com/[slug]</code>.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg border border-button-primary bg-button-primary px-3.5 py-[7px] text-[13px] font-medium text-white transition hover:border-button-primary-hover hover:bg-button-primary-hover"
          >
            + Crear nueva página
          </button>
        </div>

        {isLoading && (
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex animate-pulse items-center gap-3 rounded-lg border border-surface-inset bg-white px-4 py-3">
                <div className="h-4 w-4 shrink-0 rounded bg-surface-accent" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3 w-2/5 rounded bg-surface-accent" />
                  <div className="h-2 w-1/4 rounded bg-surface-accent" />
                </div>
                <div className="h-5 w-16 rounded-full bg-surface-accent" />
              </li>
            ))}
          </ul>
        )}

        {error && !isLoading && (
          <div className="rounded-lg border border-[#0070f3]/30 bg-[#0070f3]/10 px-4 py-3 text-[13px] font-medium text-[#0070f3]">
            {error.message}
          </div>
        )}

        {!isLoading && !error && pages.length === 0 && (
          <div className="rounded-lg border border-dashed border-surface-inset bg-white px-4 py-12 text-center text-[13px] text-text-tertiary">
            No hay páginas todavía. Creá la primera con el botón de arriba.
          </div>
        )}

        {!isLoading && pages.length > 0 && (
          <ul className="flex flex-col gap-2">
            {[...pages].sort((a, b) => (a.slug === "home" ? -1 : b.slug === "home" ? 1 : 0)).map((p) => (
              <li key={p.slug}>
                <button
                  onClick={() => navigate(`/edit/${p.slug}`)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-surface-inset bg-white px-4 py-3 text-left transition hover:border-success"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {p.slug === "home" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0 text-text-tertiary"
                        aria-hidden="true"
                      >
                        <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0 text-text-tertiary"
                        aria-hidden="true"
                      >
                        <path d="M20.59 13.41 12 22l-9-9V3h10z" />
                        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
                      </svg>
                    )}
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[14px] font-semibold text-text-primary">
                        {p.title ?? p.slug}
                      </span>
                      <span className="truncate text-[11.5px] text-text-tertiary">
                        /{p.slug}
                        {p.tag_slug && (
                          <>
                            {" · "}
                            <span className="font-medium text-text-secondary">
                              tag: {p.tag_slug}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {locks.has(p.slug) && locks.get(p.slug) !== email && (
                      <span
                        title={`Editando: ${displayName(locks.get(p.slug)!)}`}
                        className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700"
                      >
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {displayName(locks.get(p.slug)!)} está editando.
                      </span>
                    )}
                    {p.is_published ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        Publicada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-[#0070f3]/10 px-2.5 py-1 text-xs font-medium text-[#0070f3]">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0070f3]" />
                        Borrador
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {showCreate && (
        <CreatePageModal
          existingSlugs={pages.map((p) => p.slug)}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); refetch(); }}
        />
      )}
    </div>
  );
}
