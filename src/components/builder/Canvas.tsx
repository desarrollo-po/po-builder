import { useLayoutStore } from "../../store/layoutStore";
import RegionList from "./RegionList";
import AddRegionModal from "./AddRegionModal";

interface Props {
  mobileHidden?: boolean;
}

export default function Canvas({ mobileHidden }: Props) {
  const { layout } = useLayoutStore();

  if (!layout) {
    return (
      <div
        className={mobileHidden ? "hidden md:flex" : "flex"}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
          fontSize: "14px",
        }}
      >
        No layout loaded
      </div>
    );
  }

  return (
    <div
      className={mobileHidden ? "hidden md:flex" : "flex"}
      style={{
        flex: 1,
        flexDirection: "column",
        overflow: "auto",
        background: "var(--surface-base)",
      }}
    >
      <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0" }}>
          <RegionList regions={layout.layout} />
          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <AddRegionModal />
          </div>
        </div>
      </div>
    </div>
  );
}
