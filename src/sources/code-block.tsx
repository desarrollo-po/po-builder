import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { ContentPage, ContentSource } from "./types";

const SOURCE_ID = "code-block";

function CodeForm() {
  const [html, setHtml] = useState("");
  const isValid = html.trim().length > 0;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: "new-code-block",
    data: { type: "code", html },
  });

  return (
    <div className="flex flex-col gap-3.5 p-3">
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.3px] text-text-secondary">
          HTML crudo
        </label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder='<iframe src="https://..."></iframe>'
          rows={8}
          className="w-full resize-y rounded-lg border border-border-strong bg-white p-3 font-mono text-xs text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <p className="mt-1.5 text-[10.5px] text-text-tertiary">
          Soporta cualquier etiqueta HTML (iframes, scripts de embed, markup a mano).
        </p>
      </div>

      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`rounded-lg border-2 border-dashed p-3.5 text-center transition-colors ${
          isValid
            ? "cursor-grab border-accent bg-accent/5"
            : "cursor-default border-border-strong bg-surface-secondary"
        } ${isDragging ? "cursor-grabbing opacity-50" : ""}`}
      >
        <p
          className={`m-0 text-[13px] font-medium ${
            isValid ? "text-accent" : "text-text-tertiary"
          }`}
        >
          {isValid ? "Arrastrar para agregar bloque de código" : "Pegar HTML para habilitar"}
        </p>
      </div>

      {html.trim() && (
        <div className="rounded-lg border border-border bg-surface-secondary p-2">
          <p className="mb-2 text-[11px] text-text-tertiary">Vista previa</p>
          <div
            className="max-h-40 overflow-auto rounded-md bg-white"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}

// ponytail: no fetchable list — this tab authors content instead of browsing
// it. Stubs below satisfy ContentSource and are never called (formOnly skips
// SourceBrowser's fetch/list machinery).
async function fetchPage(): Promise<ContentPage<never>> {
  return { items: [], pageInfo: { hasNextPage: false, endCursor: null } };
}

export const codeBlock: ContentSource<never> = {
  id: SOURCE_ID,
  label: "Code",
  formOnly: true,
  renderHeader: CodeForm,
  fetchPage,
  ItemCard: () => null,
  getItemKey: () => "",
};
