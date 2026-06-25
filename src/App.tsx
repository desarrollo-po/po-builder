import { useEffect, useState } from "react";
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
import { useAuthStore } from "./store/authStore";

type Mode = "edit" | "preview";

function App() {
  return (
    <AuthGate>
      <Builder />
    </AuthGate>
  );
}

function Builder() {
  const { initializeLayout, layout } = useLayoutStore();
  const { handleDragEnd } = useDragHandlers();
  const [mode, setMode] = useState<Mode>("edit");
  const authStatus = useAuthStore((s) => s.status);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    // ponytail: only fetch once authenticated, so the request carries the JWT
    // and the tightened RLS policy returns rows instead of an empty result.
    if (authStatus !== "authenticated") return;
    const loadPageLayout = async () => {
      const existingLayout = await loadLayout("home");
      initializeLayout("home", existingLayout);
    };

    loadPageLayout();
  }, [initializeLayout, authStatus]);

  const handleAppDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event);
  };

  if (!layout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "4px",
        padding: "8px",
        borderBottom: "1px solid var(--border)",
        background: "#ffffff",
      }}
    >
      {(["edit", "preview"] as Mode[]).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            style={{
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 500,
              border: "1px solid var(--border-strong)",
              borderRadius: "6px",
              background: active ? "#0070f3" : "#ffffff",
              color: active ? "#ffffff" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 120ms ease-out",
            }}
          >
            {m === "edit" ? "Editor" : "Vista previa"}
          </button>
        );
      })}
    </div>
  );
}

export default App;
