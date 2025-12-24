import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";

// Custom Node Component for UML Class
const ClassNode = ({ data }) => {
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
          fontWeight: "bold",
          fontSize: "14px",
          borderBottom: "2px solid " + (data.borderColor || "#3b82f6"),
          textAlign: "center",
          background: data.headerBackground || "#f8fafc",
        }}
      >
        {data.className}
        <div style={{ fontSize: "11px", fontWeight: "normal", color: "#64748b", marginTop: "2px" }}>({data.keyLetter})</div>
      </div>

      {/* Attributes Section */}
      <div
        style={{
          padding: "8px 12px",
          background: "#ffffff",
        }}
      >
        {data.attributes && data.attributes.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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

const nodeTypes = {
  classNode: ClassNode,
};

export default function VisualizationPage() {
  const navigate = useNavigate();
  const [modelData, setModelData] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const buildDiagram = useCallback(
    (model) => {
      if (!model?.system_model?.subsystems?.[0]) return;

      const subsystem = model.system_model.subsystems[0];
      const classes = subsystem.classes || [];
      const relationships = subsystem.relationships || [];

      console.log("Building diagram with:", { classes, relationships });

      const newNodes = [];
      const newEdges = [];
      let yOffset = 0;
      const verticalGap = 200;
      const horizontalGap = 350;

      // Find supertype relationships
      const subtypeRels = relationships.filter((r) => r.type === "Subtype");
      const supertypeKeys = subtypeRels.map((r) => r.superclass.key_letter);
      const subtypeKeys = subtypeRels.flatMap((r) => r.subclasses.map((s) => s.key_letter));

      // Separate classes by role
      const superclasses = classes.filter((c) => supertypeKeys.includes(c.key_letter));
      const subclasses = classes.filter((c) => subtypeKeys.includes(c.key_letter));
      const associationClasses = classes.filter((c) => c.type === "Association");
      const regularClasses = classes.filter(
        (c) => !supertypeKeys.includes(c.key_letter) && !subtypeKeys.includes(c.key_letter) && c.type !== "Association"
      );

      // Render superclasses first (top level)
      superclasses.forEach((cls, index) => {
        const attributes = cls.attributes.map((attr) => {
          return {
            name: attr.name,
            type: attr.type,
          };
        });

        newNodes.push({
          id: cls.key_letter,
          type: "classNode",
          position: { x: index * horizontalGap, y: yOffset },
          data: {
            className: cls.name,
            keyLetter: cls.key_letter,
            attributes: attributes,
            backgroundColor: "#ffffff",
            borderColor: "#3b82f6",
            headerBackground: "#dbeafe",
          },
        });
      });

      yOffset += verticalGap;

      // Render subclasses
      subclasses.forEach((cls, index) => {
        const attributes = cls.attributes.map((attr) => {
          return {
            name: attr.name,
            type: attr.type,
          };
        });

        newNodes.push({
          id: cls.key_letter,
          type: "classNode",
          position: { x: index * horizontalGap, y: yOffset },
          data: {
            className: cls.name,
            keyLetter: cls.key_letter,
            attributes: attributes,
            backgroundColor: "#ffffff",
            borderColor: "#10b981",
            headerBackground: "#d1fae5",
          },
        });
      });

      yOffset += verticalGap;

      // Render regular classes
      regularClasses.forEach((cls, index) => {
        const attributes = cls.attributes.map((attr) => {
          return {
            name: attr.name,
            type: attr.type,
          };
        });

        newNodes.push({
          id: cls.key_letter,
          type: "classNode",
          position: { x: index * horizontalGap, y: yOffset },
          data: {
            className: cls.name,
            keyLetter: cls.key_letter,
            attributes: attributes,
            backgroundColor: "#ffffff",
            borderColor: "#6b7280",
            headerBackground: "#f1f5f9",
          },
        });
      });

      yOffset += verticalGap;

      // Render association classes
      associationClasses.forEach((cls, index) => {
        const attributes = cls.attributes.map((attr) => {
          return {
            name: attr.name,
            type: attr.type,
          };
        });

        newNodes.push({
          id: cls.key_letter,
          type: "classNode",
          position: { x: index * horizontalGap + horizontalGap / 2, y: yOffset },
          data: {
            className: cls.name,
            keyLetter: cls.key_letter,
            attributes: attributes,
            backgroundColor: "#fef3c7",
            borderColor: "#f59e0b",
            headerBackground: "#fde68a",
          },
        });
      });

      // Build edges
      relationships.forEach((rel) => {
        if (rel.type === "Subtype") {
          rel.subclasses.forEach((sub) => {
            newEdges.push({
              id: `${rel.superclass.key_letter}-${sub.key_letter}`,
              source: rel.superclass.key_letter,
              target: sub.key_letter,
              label: rel.label,
              type: "default",
              animated: false,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 25,
                height: 25,
                color: "#3b82f6",
              },
              style: {
                stroke: "#3b82f6",
                strokeWidth: 3,
              },
              labelStyle: {
                fill: "#1e40af",
                fontWeight: 700,
                fontSize: "13px",
              },
              labelBgStyle: {
                fill: "#ffffff",
                fillOpacity: 0.95,
              },
              labelBgPadding: [8, 6],
              labelBgBorderRadius: 4,
            });
          });
        } else if (rel.type === "Associative") {
          const oneSide = rel.one_side;
          const otherSide = rel.other_side;
          const assocClass = rel.association_class;

          // Edge from one side to association class
          newEdges.push({
            id: `${oneSide.key_letter}-${assocClass.key_letter}`,
            source: oneSide.key_letter,
            target: assocClass.key_letter,
            type: "default",
            label: `${rel.label}: "${oneSide.phrase}"`,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#f59e0b",
            },
            style: {
              stroke: "#f59e0b",
              strokeWidth: 3,
            },
            labelStyle: {
              fill: "#92400e",
              fontWeight: 700,
              fontSize: "12px",
            },
            labelBgStyle: {
              fill: "#ffffff",
              fillOpacity: 0.95,
            },
            labelBgPadding: [8, 10],
            labelBgBorderRadius: 4,
          });

          // Edge from association class to other side
          newEdges.push({
            id: `${assocClass.key_letter}-${otherSide.key_letter}`,
            source: assocClass.key_letter,
            target: otherSide.key_letter,
            type: "default",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#f59e0b",
            },
            style: {
              stroke: "#f59e0b",
              strokeWidth: 3,
            },
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    const stored = localStorage.getItem("parsedModel");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setModelData(parsed);
        buildDiagram(parsed);
      } catch (error) {
        console.error("Error loading model data:", error);
      }
    }
  }, [buildDiagram]);

  const handleContinue = () => {
    navigate("/translation");
  };

  if (!modelData) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Tidak ada data model</div>
              <p className="text-sm mb-4">Silakan parse JSON model terlebih dahulu.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/parsing")}
              >
                Kembali ke Parsing
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-6"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Model Visualization</h1>
        <p className="text-muted-foreground">Visualisasi class diagram dan relationship model</p>
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{
            hideAttribution: true,
          }}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Controls
            position="top-right"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              margin: "10px",
            }}
          />
          <Background />
        </ReactFlow>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => navigate("/parsing")}
        >
          ← Kembali ke Parsing
        </Button>
        <Button onClick={handleContinue}>Lanjut ke Translasi →</Button>
      </div>
    </div>
  );
}
