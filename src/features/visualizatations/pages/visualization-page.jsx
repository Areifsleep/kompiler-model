import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { useModel } from "@/contexts/ModelContext";

import { nodeTypes } from "../components/class-node";

export default function VisualizationPage() {
  const navigate = useNavigate();
  const { parsedModel } = useModel();
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
          position: {
            x: index * horizontalGap + horizontalGap / 2,
            y: yOffset,
          },
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

      // Build edges - UML Professional Standards
      relationships.forEach((rel) => {
        if (rel.type === "Subtype") {
          // Generalization/Inheritance - Hollow Triangle (from child to parent in UML standard)
          rel.subclasses.forEach((sub) => {
            newEdges.push({
              id: `${rel.superclass.key_letter}-${sub.key_letter}`,
              source: rel.superclass.key_letter,
              target: sub.key_letter,
              label: `${rel.label} (Inheritance)`,
              type: "smoothstep",
              animated: false,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 25,
                height: 25,
                color: "#3b82f6",
              },
              style: {
                stroke: "#3b82f6",
                strokeWidth: 2.5,
              },
              labelStyle: {
                fill: "#1e40af",
                fontWeight: 600,
                fontSize: "12px",
              },
              labelBgStyle: {
                fill: "#dbeafe",
                fillOpacity: 0.95,
              },
              labelBgPadding: [8, 6],
              labelBgBorderRadius: 4,
            });
          });
        } else if (rel.type === "Associative") {
          // Many-to-Many with Association Class
          const oneSide = rel.one_side;
          const otherSide = rel.other_side;
          const assocClass = rel.association_class;

          newEdges.push({
            id: `${oneSide.key_letter}-${assocClass.key_letter}`,
            source: oneSide.key_letter,
            target: assocClass.key_letter,
            type: "smoothstep",
            label: `${rel.label} (M:N)`,
            style: {
              stroke: "#f59e0b",
              strokeWidth: 2,
            },
            labelStyle: {
              fill: "#92400e",
              fontWeight: 600,
              fontSize: "11px",
            },
            labelBgStyle: {
              fill: "#fef3c7",
              fillOpacity: 0.95,
            },
            labelBgPadding: [6, 4],
            labelBgBorderRadius: 3,
          });

          newEdges.push({
            id: `${assocClass.key_letter}-${otherSide.key_letter}`,
            source: assocClass.key_letter,
            target: otherSide.key_letter,
            type: "smoothstep",
            style: {
              stroke: "#f59e0b",
              strokeWidth: 2,
            },
          });
        } else if (rel.type === "Simple") {
          // Simple Association (One-to-Many)
          const oneSide = rel.one_side;
          const otherSide = rel.other_side;

          if (oneSide && otherSide) {
            const sourceKL = oneSide.mult === "One" ? oneSide.key_letter : otherSide.key_letter;
            const targetKL = oneSide.mult === "Many" ? oneSide.key_letter : otherSide.key_letter;

            newEdges.push({
              id: `${sourceKL}-${targetKL}-${rel.label}`,
              source: sourceKL,
              target: targetKL,
              label: `${rel.label} (1:N)`,
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.Arrow,
                width: 20,
                height: 20,
                color: "#8b5cf6",
              },
              style: {
                stroke: "#8b5cf6",
                strokeWidth: 2,
              },
              labelStyle: {
                fill: "#6d28d9",
                fontWeight: 600,
                fontSize: "11px",
              },
              labelBgStyle: {
                fill: "#ede9fe",
                fillOpacity: 0.95,
              },
              labelBgPadding: [6, 4],
              labelBgBorderRadius: 3,
            });
          }
        } else if (rel.type === "Composition") {
          // Composition - Filled Diamond (Strong Ownership)
          const oneSide = rel.one_side;
          const otherSide = rel.other_side;

          if (oneSide && otherSide) {
            // Container (One side) -> Contained (Other side)
            const sourceKL = oneSide.key_letter;
            const targetKL = otherSide.key_letter;

            newEdges.push({
              id: `${sourceKL}-${targetKL}-${rel.label}`,
              source: sourceKL,
              target: targetKL,
              label: `${rel.label} (Composition)`,
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 22,
                height: 22,
                color: "#dc2626",
              },
              style: {
                stroke: "#dc2626",
                strokeWidth: 2.5,
                strokeDasharray: "0",
              },
              labelStyle: {
                fill: "#991b1b",
                fontWeight: 700,
                fontSize: "11px",
              },
              labelBgStyle: {
                fill: "#fee2e2",
                fillOpacity: 0.95,
              },
              labelBgPadding: [6, 4],
              labelBgBorderRadius: 3,
            });
          }
        } else if (rel.type === "Aggregation") {
          // Aggregation - Hollow Diamond (Weak Ownership)
          const oneSide = rel.one_side;
          const otherSide = rel.other_side;
          const assocClass = rel.association_class;

          if (oneSide && otherSide && assocClass) {
            // For aggregation with association class (like R7)
            newEdges.push({
              id: `${oneSide.key_letter}-${assocClass.key_letter}-${rel.label}`,
              source: oneSide.key_letter,
              target: assocClass.key_letter,
              label: `${rel.label} (Aggregation)`,
              type: "smoothstep",
              style: {
                stroke: "#059669",
                strokeWidth: 2,
                strokeDasharray: "5,5",
              },
              labelStyle: {
                fill: "#047857",
                fontWeight: 600,
                fontSize: "11px",
              },
              labelBgStyle: {
                fill: "#d1fae5",
                fillOpacity: 0.95,
              },
              labelBgPadding: [6, 4],
              labelBgBorderRadius: 3,
            });

            newEdges.push({
              id: `${assocClass.key_letter}-${otherSide.key_letter}-${rel.label}`,
              source: assocClass.key_letter,
              target: otherSide.key_letter,
              type: "smoothstep",
              style: {
                stroke: "#059669",
                strokeWidth: 2,
                strokeDasharray: "5,5",
              },
            });
          }
        } else if (rel.type === "Reflexive") {
          // Self-Referencing Relationship
          const oneSide = rel.one_side;

          if (oneSide) {
            newEdges.push({
              id: `${oneSide.key_letter}-self-${rel.label}`,
              source: oneSide.key_letter,
              target: oneSide.key_letter,
              label: `${rel.label} (Reflexive)`,
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.Arrow,
                width: 18,
                height: 18,
                color: "#ec4899",
              },
              style: {
                stroke: "#ec4899",
                strokeWidth: 2,
              },
              labelStyle: {
                fill: "#be185d",
                fontWeight: 600,
                fontSize: "11px",
              },
              labelBgStyle: {
                fill: "#fce7f3",
                fillOpacity: 0.95,
              },
              labelBgPadding: [6, 4],
              labelBgBorderRadius: 3,
            });
          }
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    if (parsedModel) {
      setModelData(parsedModel);
      buildDiagram(parsedModel);
    }
  }, [parsedModel, buildDiagram]);

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
        <p className="text-muted-foreground">Visualisasi class diagram dan relationship model UML</p>
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
