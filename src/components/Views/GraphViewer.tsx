"use client";

import React, { useState, useMemo } from "react";
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

interface GraphViewerProps {
  data: unknown;
}

interface GraphNode {
  id: string;
  name: string;
  type: "object" | "array" | "primitive" | "null";
  path: string;
  depth: number;
  childCount?: number;
  valueSummary?: string;
  children: GraphNode[];
}

export const GraphViewer: React.FC<GraphViewerProps> = ({ data }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Build recursive graph node hierarchy
  const rootGraphNode = useMemo(() => {
    let idCounter = 0;

    function buildNode(val: unknown, name: string, path: string, depth: number): GraphNode {
      const id = `node_${++idCounter}`;
      if (val === null) {
        return { id, name, type: "null", path, depth, valueSummary: "null", children: [] };
      }

      if (Array.isArray(val)) {
        const children = val.slice(0, 10).map((item, idx) =>
          buildNode(item, `[${idx}]`, path ? `${path}[${idx}]` : `[${idx}]`, depth + 1)
        );
        return {
          id,
          name,
          type: "array",
          path,
          depth,
          childCount: val.length,
          valueSummary: `Array[${val.length}]`,
          children,
        };
      }

      if (typeof val === "object") {
        const entries = Object.entries(val as Record<string, unknown>);
        const children = entries.slice(0, 15).map(([k, v]) =>
          buildNode(v, k, path ? `${path}.${k}` : k, depth + 1)
        );
        return {
          id,
          name,
          type: "object",
          path,
          depth,
          childCount: entries.length,
          valueSummary: `Object{${entries.length}}`,
          children,
        };
      }

      return {
        id,
        name,
        type: "primitive",
        path,
        depth,
        valueSummary: String(val),
        children: [],
      };
    }

    return buildNode(data, "root", "root", 0);
  }, [data]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Graph Toolbar */}
      <div
        className="h-10 flex items-center justify-between border-b text-xs select-none flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Network size={14} className="text-purple-400" />
            <span>Structure Topology Graph</span>
          </div>

          <div className="flex items-center gap-1 bg-[var(--bg-input)] rounded border border-[var(--border-color)] px-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              title="Zoom Out"
              className="p-1 text-[var(--text-secondary)] hover:text-white"
            >
              <ZoomOut size={12} />
            </button>
            <span className="font-mono text-[11px] px-1 text-[var(--text-primary)]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}
              title="Zoom In"
              className="p-1 text-[var(--text-secondary)] hover:text-white"
            >
              <ZoomIn size={12} />
            </button>
            <button
              onClick={() => setZoom(1)}
              title="Reset Zoom"
              className="p-1 text-[var(--text-secondary)] hover:text-white"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Object</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Array</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Primitive</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
            }}
            className="flex flex-col items-center gap-6"
          >
            <GraphNodeElement
              node={rootGraphNode}
              selectedId={selectedNode?.id}
              onSelectNode={setSelectedNode}
            />
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div
            className="w-72 border-l p-3 flex flex-col gap-2 overflow-y-auto bg-[var(--bg-secondary)] text-xs font-mono select-text"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border-subtle)" }}>
              <span className="font-semibold text-[var(--text-primary)]">Node Inspector</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block">Path:</span>
              <code className="text-[var(--json-key)] break-all">{selectedNode.path}</code>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block">Type:</span>
              <span className={`badge badge-${selectedNode.type}`}>
                {selectedNode.type}
              </span>
            </div>

            {selectedNode.childCount !== undefined && (
              <div>
                <span className="text-[var(--text-muted)] block">Children Count:</span>
                <span className="text-[var(--text-primary)] font-medium">{selectedNode.childCount} items</span>
              </div>
            )}

            <div>
              <span className="text-[var(--text-muted)] block">Value / Summary:</span>
              <div className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] break-all">
                {selectedNode.valueSummary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const GraphNodeElement: React.FC<{
  node: GraphNode;
  selectedId?: string;
  onSelectNode: (node: GraphNode) => void;
}> = ({ node, selectedId, onSelectNode }) => {
  const isSelected = selectedId === node.id;

  const nodeColor =
    node.type === "object"
      ? "border-amber-500/60 bg-amber-500/10 text-amber-500"
      : node.type === "array"
      ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300"
      : node.type === "null"
      ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
      : "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";

  return (
    <div className="flex flex-col items-center">
      {/* Node Pill */}
      <div
        onClick={() => onSelectNode(node)}
        className={`px-3 py-1.5 rounded-lg border shadow-md font-mono text-xs cursor-pointer transition-all duration-150 flex items-center gap-2 ${nodeColor} ${
          isSelected ? "ring-2 ring-[var(--accent-primary)] scale-105" : "hover:scale-102"
        }`}
      >
        <span className="font-bold text-[var(--text-primary)]">{node.name}</span>
        <span className="text-[10px] opacity-75">{node.valueSummary}</span>
      </div>

      {/* Children Tree Branch */}
      {node.children.length > 0 && (
        <div className="flex flex-col items-center">
          {/* Vertical connector line */}
          <div className="w-[1.5px] h-4 bg-[var(--border-color)]" />

          {/* Children row */}
          <div className="flex items-start gap-4 pt-1 border-t border-[var(--border-color)]">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-[1.5px] h-3 bg-[var(--border-color)] -mt-1" />
                <GraphNodeElement
                  node={child}
                  selectedId={selectedId}
                  onSelectNode={onSelectNode}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
