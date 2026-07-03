import type { CodeBlock } from "../../../types/layout";

interface Props {
  code: CodeBlock;
}

// Raw HTML/iframe embed, rendered as authored — the builder is an internal,
// authenticated tool, so admin-entered markup is trusted the same way the
// WordPress Custom HTML block trusts its editors.
export default function CodeCard({ code }: Props) {
  return (
    <div
      className="h-full w-full"
      dangerouslySetInnerHTML={{ __html: code.html }}
    />
  );
}
