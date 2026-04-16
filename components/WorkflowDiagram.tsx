"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Edge,
  MarkerType,
  Node,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

type Owner = "human" | "ai" | "hybrid";

type Step = {
  id: number;
  label: string;
  owner: Owner;
  attention: "low" | "medium" | "high";
  notes: string;
};

type Handoff = {
  from: number;
  to: number;
  type: string;
};

type WorkflowDiagramProps = {
  steps: Step[];
  handoffs: Handoff[];
};

const OWNER_STYLE: Record<Owner, { background: string; border: string; color: string }> = {
  ai: {
    background: "#C9A84C",
    border: "2px solid #C9A84C",
    color: "#000000",
  },
  human: {
    background: "#FFFFFF",
    border: "2px solid #111111",
    color: "#000000",
  },
  hybrid: {
    background: "#FFFFFF",
    border: "2px solid #C9A84C",
    color: "#000000",
  },
};

function handoffSet(handoffs: Handoff[]) {
  return new Set(handoffs.map((handoff) => `${handoff.from}->${handoff.to}`));
}

export default function WorkflowDiagram({ steps, handoffs }: WorkflowDiagramProps) {
  const { nodes, edges } = useMemo(() => {
    const explicitHandoffs = handoffSet(handoffs);

    const createdNodes: Node[] = steps.map((step, index) => {
      const ownerStyle = OWNER_STYLE[step.owner];

      return {
        id: String(step.id),
        position: { x: index * 240, y: 130 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: (
            <div className="max-w-[180px]">
              <p className="font-semibold leading-tight text-[13px]">{step.label}</p>
              <p className="mt-1 text-[11px] text-black/60 leading-snug">{step.notes}</p>
            </div>
          ),
        },
        draggable: false,
        style: {
          ...ownerStyle,
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.14)",
          width: 210,
          padding: 10,
        },
      };
    });

    const createdEdges: Edge[] = [];

    for (let i = 0; i < steps.length - 1; i += 1) {
      const from = steps[i];
      const to = steps[i + 1];
      const key = `${from.id}->${to.id}`;
      const hasExplicitHandoff = explicitHandoffs.has(key);
      const ownerChanged = from.owner !== to.owner;
      const shouldDashed = hasExplicitHandoff || ownerChanged;

      createdEdges.push({
        id: `edge-${from.id}-${to.id}`,
        source: String(from.id),
        target: String(to.id),
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: shouldDashed ? "#C9A84C" : "#9CA3AF",
        },
        style: {
          stroke: shouldDashed ? "#C9A84C" : "#9CA3AF",
          strokeWidth: 2,
          strokeDasharray: shouldDashed ? "6 5" : undefined,
        },
      });
    }

    return { nodes: createdNodes, edges: createdEdges };
  }, [handoffs, steps]);

  return (
    <div className="h-[360px] min-h-[300px] w-full rounded-xl border border-white/10 bg-zinc-950/80">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#2a2a2a" gap={32} size={1} />
      </ReactFlow>
    </div>
  );
}
