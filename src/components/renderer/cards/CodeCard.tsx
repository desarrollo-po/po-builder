import { useEffect, useRef } from "react";
import type { CodeBlock } from "../../../types/layout";

interface Props {
  code: CodeBlock;
}

// Raw HTML/iframe embed, rendered as authored — the builder is an internal,
// authenticated tool, so admin-entered markup is trusted the same way the
// WordPress Custom HTML block trusts its editors.
export default function CodeCard({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // dangerouslySetInnerHTML never executes injected <script> tags (DOM
    // spec, not a React bug) — recreate each one so embeds like Twitter's
    // widgets.js actually run instead of leaving raw markup on screen.
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      oldScript.getAttributeNames().forEach((name) => {
        newScript.setAttribute(name, oldScript.getAttribute(name) ?? "");
      });
      newScript.text = oldScript.text;
      oldScript.replaceWith(newScript);
    });
  }, [code.html]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      dangerouslySetInnerHTML={{ __html: code.html }}
    />
  );
}
