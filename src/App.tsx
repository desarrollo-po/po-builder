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
import { loadLayout } from "./lib/supabase";
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    // ponytail: only fetch once authenticated, so the request carries the JWT
    // and the tightened RLS policy returns rows instead of an empty result.
    if (authStatus !== "authenticated") return;
    if (!slug) return;
    let cancelled = false;
    const loadPageLayout = async () => {
      const existingLayout = await loadLayout(slug);
      if (cancelled) return;
      if (!existingLayout) {
        // Page doesn't exist in Supabase — bounce back to the list rather
        // than scaffolding an orphan layout from the URL.
        setLoadFailed(true);
        return;
      }
      initializeLayout(slug, existingLayout);
    };
    loadPageLayout();
    return () => {
      cancelled = true;
    };
  }, [initializeLayout, authStatus, slug]);

  useEffect(() => {
    if (loadFailed) navigate("/", { replace: true });
  }, [loadFailed, navigate]);

  const handleAppDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event);
  };

  if (!layout || layout.slug !== slug) {
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
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 cursor-pointer border-none ${
                active
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
