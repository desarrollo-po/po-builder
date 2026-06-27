import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useLayoutStore } from "./store/layoutStore";
import {
  loadLayout,
  acquireLock,
  releaseLock,
  refreshLock,
  checkLock,
} from "./lib/supabase";
import { displayName } from "./lib/utils";
import Canvas from "./components/builder/Canvas";
import Sidebar from "./components/sidebar/Sidebar";
import BuilderToolbar from "./components/builder/BuilderToolbar";
import DragOverlayContent from "./components/DragOverlayContent";
import PageRenderer from "./components/renderer/PageRenderer";
import useDragHandlers from "./hooks/useDragHandlers";
import AuthGate from "./components/auth/AuthGate";
import PagesList from "./components/pages/PagesList";
import { useAuthStore } from "./store/authStore";

type Mode = "edit" | "preview";

function App() {
  return (
    <AuthGate>
      <BrowserRouter basename={'/po-builder/'}>
        <Routes>
          <Route path="/" element={<PagesList />} />
          <Route path="/edit/:slug" element={<Builder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthGate>
  );
}

function Builder() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { initializeLayout, layout } = useLayoutStore();
  const { handleDragEnd } = useDragHandlers();
  const [mode, setMode] = useState<Mode>("edit");
  const [loadFailed, setLoadFailed] = useState(false);
  const authStatus = useAuthStore((s) => s.status);
  const email = useAuthStore((s) => s.email);
  const [lockState, setLockState] = useState<"checking" | "owned" | "blocked">("checking");
  const [lockOwner, setLockOwner] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (authStatus !== "authenticated" || !slug || !email) return;
    let cancelled = false;
    const run = async () => {
      const lock = await acquireLock(slug, email);
      if (cancelled) return;
      if (!lock.ok) {
        setLockOwner(lock.lockedBy!);
        setLockState("blocked");
        return;
      }
      const existingLayout = await loadLayout(slug);
      if (cancelled) return;
      if (!existingLayout) { setLoadFailed(true); return; }
      initializeLayout(slug, existingLayout);
      setLockState("owned");
    };
    run();
    return () => { cancelled = true; };
  }, [authStatus, slug, email, initializeLayout]);

  useEffect(() => {
    if (loadFailed) navigate("/", { replace: true });
  }, [loadFailed, navigate]);

  // Heartbeat (keep lock alive) + takeover detection (detect if kicked)
  useEffect(() => {
    if (lockState !== "owned" || !slug || !email) return;
    const heartbeat = setInterval(() => refreshLock(slug, email), 2 * 60 * 1000);
    const poll = setInterval(async () => {
      const cur = await checkLock(slug);
      if (!cur) {
        acquireLock(slug, email, true); // lock expired, silently re-acquire
      } else if (cur.locked_by !== email) {
        sessionStorage.setItem("po-kicked", `${cur.locked_by}|${slug}`);
        navigate("/");
      }
    }, 30 * 1000);
    const onUnload = () => releaseLock(slug, email);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(heartbeat);
      clearInterval(poll);
      window.removeEventListener("beforeunload", onUnload);
      releaseLock(slug, email);
    };
  }, [lockState, slug, email, navigate]);

  const handleTakeover = async () => {
    if (!slug || !email) return;
    setLockState("checking");
    await acquireLock(slug, email, true);
    const existingLayout = await loadLayout(slug);
    if (!existingLayout) { navigate("/"); return; }
    initializeLayout(slug, existingLayout);
    setLockState("owned");
  };

  const handleAppDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event);
  };

  if (lockState === "blocked") {
    return (
      <TakeoverModal
        lockedBy={lockOwner!}
        onTakeover={handleTakeover}
        onCancel={() => navigate("/")}
      />
    );
  }

  if (lockState !== "owned" || !layout || layout.slug !== slug) {
    return (
      <div className="flex animate-pulse flex-col" style={{ height: "100vh", background: "var(--surface-base)" }}>
        <div className="h-14 shrink-0 border-b border-surface-inset bg-white" />
        <div className="h-10 shrink-0 border-b border-surface-inset bg-white" />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 shrink-0 border-r border-surface-inset bg-white" />
          <div className="flex-1 bg-surface-base" />
        </div>
      </div>
    );
  }

  if (mode === "preview") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--surface-base)" }}>
        <ModeToggle mode={mode} onChange={setMode} />
        <div style={{ flex: 1, overflow: "auto" }}>
          <PageRenderer layout={layout} />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={handleAppDragEnd}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--surface-base)" }}>
        <ModeToggle mode={mode} onChange={setMode} />
        <BuilderToolbar />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar />
          <Canvas />
        </div>
      </div>
      <DragOverlay>
        <DragOverlayContent />
      </DragOverlay>
    </DndContext>
  );
}

function TakeoverModal({
  lockedBy,
  onTakeover,
  onCancel,
}: {
  lockedBy: string;
  onTakeover: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-96 rounded-xl border border-surface-inset bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-[15px] font-semibold text-text-primary">Página en uso</h2>
        <p className="mb-5 text-[13px] text-text-secondary">
          <span className="font-medium text-text-primary">{displayName(lockedBy)}</span> está editando esta página.
          ¿Querés tomar el control igualmente?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-surface-inset bg-white px-3.5 py-[7px] text-[13px] font-medium text-text-secondary hover:bg-surface-accent"
          >
            Cancelar
          </button>
          <button
            onClick={onTakeover}
            className="rounded-lg bg-button-primary-hover px-3.5 py-[7px] text-[13px] font-medium text-white hover:bg-button-primary-hover"
          >
            Tomar control
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex justify-center p-2 border-b border-[var(--border)] bg-white">
      <div className="flex bg-[var(--surface-base)] rounded-lg p-0.5 gap-0.5">
        {(["edit", "preview"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer border-none ${active
                ? "bg-white text-[var(--text-primary)] shadow-sm"
                : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
            >
              {m === "edit" ? "Editor" : "Vista previa"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
