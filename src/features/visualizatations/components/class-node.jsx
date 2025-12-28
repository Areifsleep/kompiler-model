import { Handle, Position } from "reactflow";

export const ClassNode = ({ data }) => {
  return (
    <div
      style={{
        background: data.backgroundColor || "#ffffff",
        border: `2px solid ${data.borderColor || "#3b82f6"}`,
        borderRadius: "6px",
        minWidth: "250px",
        fontSize: "12px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />

      {/* Class Header */}
      <div
        style={{
          padding: "10px 12px",
          color: "#374151",
          fontWeight: "bold",
          fontSize: "14px",
          borderBottom: "2px solid " + (data.borderColor || "#3b82f6"),
          textAlign: "center",
          background: data.headerBackground || "#f8fafc",
        }}
      >
        {data.className}
        <div
          style={{
            fontSize: "11px",
            fontWeight: "normal",
            color: "#374151",
            marginTop: "2px",
          }}
        >
          ({data.keyLetter})
        </div>
      </div>

      {/* Attributes Section */}
      <div
        style={{
          padding: "8px 12px",
          background: "#ffffff",
        }}
      >
        {data.attributes && data.attributes.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "#374151" }}>
            {data.attributes.map((attr, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  padding: "3px 6px",
                  background: "#f8fafc",
                  borderRadius: "3px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{attr.name}</span>
                <span style={{ color: "#64748b", fontSize: "10px" }}>{attr.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: "10px", fontStyle: "italic" }}>No attributes</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
};

export const nodeTypes = {
  classNode: ClassNode,
};
