"use client";

import React, { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface TreeViewerProps {
  data: unknown;
  searchQuery?: string;
  onUpdateData?: (newData: unknown) => void;
  onSelectPath?: (path: string[]) => void;
}

interface TreeNodeProps {
  keyName?: string;
  value: unknown;
  path: string[];
  depth: number;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (pathKey: string) => void;
  searchQuery?: string;
  onUpdateValue: (path: string[], newValue: unknown) => void;
  onDeleteNode: (path: string[]) => void;
  onAddChild: (path: string[], key: string, val: unknown) => void;
  onSelectPath?: (path: string[]) => void;
}

export const TreeViewer: React.FC<TreeViewerProps> = ({
  data,
  searchQuery = "",
  onUpdateData,
  onSelectPath,
}) => {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({
    root: true,
  });

  const handleToggleExpand = useCallback((pathKey: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [pathKey]: !prev[pathKey],
    }));
  }, []);

  const expandToDepth = useCallback((targetDepth: number) => {
    const newMap: Record<string, boolean> = { root: true };

    function traverse(node: unknown, curPath: string[], curDepth: number) {
      const pathKey = curPath.length ? curPath.join(".") : "root";
      if (curDepth <= targetDepth) {
        newMap[pathKey] = true;
      } else {
        newMap[pathKey] = false;
      }

      if (node && typeof node === "object") {
        if (Array.isArray(node)) {
          node.forEach((item, idx) => {
            traverse(item, [...curPath, String(idx)], curDepth + 1);
          });
        } else {
          Object.entries(node as Record<string, unknown>).forEach(([k, v]) => {
            traverse(v, [...curPath, k], curDepth + 1);
          });
        }
      }
    }

    traverse(data, [], 0);
    setExpandedMap(newMap);
  }, [data]);

  const expandAll = useCallback(() => {
    const newMap: Record<string, boolean> = { root: true };
    function traverse(node: unknown, curPath: string[]) {
      const pathKey = curPath.length ? curPath.join(".") : "root";
      newMap[pathKey] = true;
      if (node && typeof node === "object") {
        if (Array.isArray(node)) {
          node.forEach((item, idx) => traverse(item, [...curPath, String(idx)]));
        } else {
          Object.entries(node as Record<string, unknown>).forEach(([k, v]) => traverse(v, [...curPath, k]));
        }
      }
    }
    traverse(data, []);
    setExpandedMap(newMap);
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedMap({ root: true });
  }, []);

  const handleUpdateValue = useCallback(
    (path: string[], newValue: unknown) => {
      if (!onUpdateData) return;
      if (path.length === 0) {
        onUpdateData(newValue);
        return;
      }

      // Clone deeply
      const clone = JSON.parse(JSON.stringify(data));
      let cur: Record<string, unknown> | unknown[] = clone;

      for (let i = 0; i < path.length - 1; i++) {
        const seg = path[i];
        if (Array.isArray(cur)) {
          cur = cur[parseInt(seg, 10)] as Record<string, unknown>;
        } else {
          cur = (cur as Record<string, unknown>)[seg] as Record<string, unknown>;
        }
      }

      const lastSeg = path[path.length - 1];
      if (Array.isArray(cur)) {
        cur[parseInt(lastSeg, 10)] = newValue;
      } else {
        (cur as Record<string, unknown>)[lastSeg] = newValue;
      }

      onUpdateData(clone);
    },
    [data, onUpdateData]
  );

  const handleDeleteNode = useCallback(
    (path: string[]) => {
      if (!onUpdateData || path.length === 0) return;
      const clone = JSON.parse(JSON.stringify(data));
      let cur: Record<string, unknown> | unknown[] = clone;

      for (let i = 0; i < path.length - 1; i++) {
        const seg = path[i];
        if (Array.isArray(cur)) {
          cur = cur[parseInt(seg, 10)] as Record<string, unknown>;
        } else {
          cur = (cur as Record<string, unknown>)[seg] as Record<string, unknown>;
        }
      }

      const lastSeg = path[path.length - 1];
      if (Array.isArray(cur)) {
        cur.splice(parseInt(lastSeg, 10), 1);
      } else {
        delete (cur as Record<string, unknown>)[lastSeg];
      }

      onUpdateData(clone);
    },
    [data, onUpdateData]
  );

  const handleAddChild = useCallback(
    (path: string[], key: string, val: unknown) => {
      if (!onUpdateData) return;
      const clone = JSON.parse(JSON.stringify(data));
      let cur: Record<string, unknown> | unknown[] = clone;

      for (let i = 0; i < path.length; i++) {
        const seg = path[i];
        if (Array.isArray(cur)) {
          cur = cur[parseInt(seg, 10)] as Record<string, unknown>;
        } else {
          cur = (cur as Record<string, unknown>)[seg] as Record<string, unknown>;
        }
      }

      if (Array.isArray(cur)) {
        cur.push(val);
      } else if (typeof cur === "object" && cur !== null) {
        (cur as Record<string, unknown>)[key] = val;
      }

      onUpdateData(clone);
    },
    [data, onUpdateData]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Tree Controls Toolbar */}
      <div
        className="h-10 flex items-center justify-between border-b text-xs select-none flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="flex items-center gap-1 text-[var(--text-secondary)]">
          <span className="font-semibold text-xs text-[var(--text-primary)] mr-1">Levels:</span>
          <button
            onClick={() => expandToDepth(1)}
            className="text-xs rounded-md hover:bg-[var(--bg-hover)] font-medium text-[var(--text-primary)] transition-all flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            Level 1
          </button>
          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />
          <button
            onClick={() => expandToDepth(2)}
            className="text-xs rounded-md hover:bg-[var(--bg-hover)] font-medium text-[var(--text-primary)] transition-all flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            Level 2
          </button>
          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />
          <button
            onClick={() => expandToDepth(3)}
            className="text-xs rounded-md hover:bg-[var(--bg-hover)] font-medium text-[var(--text-primary)] transition-all flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            Level 3
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] font-medium text-[var(--text-primary)] transition-all flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Maximize2 size={13} />
            <span>Expand All</span>
          </button>
          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />
          <button
            onClick={collapseAll}
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] font-medium text-[var(--text-primary)] transition-all flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Minimize2 size={13} />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Main Tree Node Canvas */}
      <div
        className="flex-1 overflow-auto font-mono text-xs leading-relaxed"
        style={{
          paddingLeft: "12px",
          paddingRight: "12px",
          paddingTop: "12px",
          paddingBottom: "12px",
        }}
      >
        <TreeNode
          value={data}
          path={[]}
          depth={0}
          expandedMap={expandedMap}
          onToggleExpand={handleToggleExpand}
          searchQuery={searchQuery}
          onUpdateValue={handleUpdateValue}
          onDeleteNode={handleDeleteNode}
          onAddChild={handleAddChild}
          onSelectPath={onSelectPath}
        />
      </div>
    </div>
  );
};

const TreeNode: React.FC<TreeNodeProps> = ({
  keyName,
  value,
  path,
  depth,
  expandedMap,
  onToggleExpand,
  searchQuery = "",
  onUpdateValue,
  onDeleteNode,
  onAddChild,
  onSelectPath,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropVal, setNewPropVal] = useState("");
  const [copied, setCopied] = useState(false);

  const pathKey = path.length ? path.join(".") : "root";
  const isExpanded = expandedMap[pathKey] ?? depth < 2;

  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isContainer = isObject || isArray;

  const nodeType =
    value === null
      ? "null"
      : isArray
      ? "array"
      : typeof value === "object"
      ? "object"
      : typeof value;

  const childCount = isArray
    ? (value as unknown[]).length
    : isObject
    ? Object.keys(value as Record<string, unknown>).length
    : 0;

  // Search matching
  const keyMatches =
    searchQuery &&
    keyName &&
    keyName.toLowerCase().includes(searchQuery.toLowerCase());
  const valueMatches =
    searchQuery &&
    !isContainer &&
    String(value).toLowerCase().includes(searchQuery.toLowerCase());

  const handleStartEdit = () => {
    setEditValue(typeof value === "string" ? value : JSON.stringify(value));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    let parsed: unknown = editValue;
    try {
      if (editValue === "null") parsed = null;
      else if (editValue === "true") parsed = true;
      else if (editValue === "false") parsed = false;
      else if (!isNaN(Number(editValue)) && editValue.trim() !== "") parsed = Number(editValue);
      else if (editValue.startsWith("{") || editValue.startsWith("[")) parsed = JSON.parse(editValue);
    } catch {
      parsed = editValue;
    }
    onUpdateValue(path, parsed);
    setIsEditing(false);
  };

  const handleCopyNode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleAddPropSubmit = () => {
    if (!newPropKey && isObject) return;
    let parsedVal: unknown = newPropVal;
    try {
      parsedVal = JSON.parse(newPropVal);
    } catch {
      parsedVal = newPropVal;
    }
    onAddChild(path, newPropKey || "item", parsedVal);
    setIsAddingProperty(false);
    setNewPropKey("");
    setNewPropVal("");
  };

  return (
    <div className="flex flex-col select-text">
      {/* Node Row */}
      <div
        onClick={() => onSelectPath?.(path)}
        className={`group flex items-center gap-1.5 py-0.5 px-1 rounded hover:bg-[var(--bg-hover)] transition-colors cursor-pointer ${
          keyMatches || valueMatches ? "bg-amber-500/20 ring-1 ring-amber-500/50" : ""
        }`}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {/* Toggle Arrow */}
        {isContainer ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(pathKey);
            }}
            className="w-4 h-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Key Name */}
        {keyName !== undefined && (
          <div className="flex items-center gap-1">
            <span
              className="font-medium text-[var(--json-key)] group-hover:underline"
              title={`Key: ${keyName}`}
            >
              {/^\d+$/.test(keyName) ? (
                <span className="text-[10px] px-1 py-0.2 rounded bg-[var(--bg-input)] text-[var(--text-secondary)] font-semibold mr-1">
                  [{keyName}]
                </span>
              ) : (
                `"${keyName}": `
              )}
            </span>
          </div>
        )}

        {/* Value Display / Editor */}
        {isContainer ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`badge ${isArray ? "badge-array" : "badge-object"}`}
            >
              {isArray ? `Array[${childCount}]` : `Object{${childCount}}`}
            </span>
            {!isExpanded && (
              <span className="text-[var(--text-muted)] text-[11px]">
                {isArray ? `[...]` : `{...}`}
              </span>
            )}
          </div>
        ) : isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              autoFocus
              className="bg-[var(--bg-input)] text-[var(--text-primary)] text-xs px-1.5 py-0.5 rounded outline-none border border-[var(--accent-primary)] font-mono min-w-[120px]"
            />
            <button
              onClick={handleSaveEdit}
              className="px-1.5 py-0.5 rounded bg-[var(--accent-primary)] text-white text-[11px]"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-1.5 py-0.5 rounded hover:bg-[var(--bg-hover)] text-[11px] text-[var(--text-muted)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span
              onDoubleClick={handleStartEdit}
              className={`cursor-pointer ${
                nodeType === "string"
                  ? "text-[var(--json-string)]"
                  : nodeType === "number"
                  ? "text-[var(--json-number)]"
                  : nodeType === "boolean"
                  ? "text-[var(--json-boolean)] font-semibold"
                  : "text-[var(--json-null)] italic"
              }`}
            >
              {nodeType === "string"
                ? `"${value}"`
                : nodeType === "null"
                ? "null"
                : String(value)}
            </span>
            <span className={`badge badge-${nodeType} text-[9px] py-0 px-1 opacity-75`}>
              {nodeType}
            </span>
          </div>
        )}

        {/* Hover Actions (Copy, Edit, Add, Delete) */}
        <div
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto flex-shrink-0 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() =>
              handleCopyNode(
                typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)
              )
            }
            title="Copy Value"
            className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
          </button>

          {!isContainer && (
            <button
              onClick={handleStartEdit}
              title="Edit Value (Double-click)"
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Edit2 size={11} />
            </button>
          )}

          {isContainer && (
            <button
              onClick={() => {
                if (!isExpanded) onToggleExpand(pathKey);
                setIsAddingProperty(true);
              }}
              title="Add Child Element"
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-emerald-500 hover:text-emerald-400"
            >
              <Plus size={12} />
            </button>
          )}

          {path.length > 0 && (
            <button
              onClick={() => onDeleteNode(path)}
              title="Delete Node"
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-red-400 hover:text-red-300"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Add Property Sub-form */}
      {isAddingProperty && (
        <div
          className="flex items-center gap-1.5 py-1 px-2 my-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
          style={{ marginLeft: `${(depth + 1) * 16}px` }}
        >
          {isObject && (
            <input
              type="text"
              placeholder="key"
              value={newPropKey}
              onChange={(e) => setNewPropKey(e.target.value)}
              className="bg-[var(--bg-input)] text-[var(--text-primary)] text-xs px-1.5 py-0.5 rounded outline-none border border-[var(--border-color)] w-28"
            />
          )}
          <input
            type="text"
            placeholder="value (e.g. 123, true, 'text')"
            value={newPropVal}
            onChange={(e) => setNewPropVal(e.target.value)}
            className="bg-[var(--bg-input)] text-[var(--text-primary)] text-xs px-1.5 py-0.5 rounded outline-none border border-[var(--border-color)] flex-1"
          />
          <button
            onClick={handleAddPropSubmit}
            className="px-2 py-0.5 rounded bg-[var(--accent-primary)] text-white text-xs font-semibold"
          >
            Add
          </button>
          <button
            onClick={() => setIsAddingProperty(false)}
            className="px-2 py-0.5 rounded hover:bg-[var(--bg-hover)] text-xs text-[var(--text-muted)]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Render Children if Container and Expanded */}
      {isContainer && isExpanded && (
        <div className="flex flex-col">
          {isArray
            ? (value as unknown[]).map((item, idx) => (
                <TreeNode
                  key={idx}
                  keyName={String(idx)}
                  value={item}
                  path={[...path, String(idx)]}
                  depth={depth + 1}
                  expandedMap={expandedMap}
                  onToggleExpand={onToggleExpand}
                  searchQuery={searchQuery}
                  onUpdateValue={onUpdateValue}
                  onDeleteNode={onDeleteNode}
                  onAddChild={onAddChild}
                  onSelectPath={onSelectPath}
                />
              ))
            : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                <TreeNode
                  key={k}
                  keyName={k}
                  value={v}
                  path={[...path, k]}
                  depth={depth + 1}
                  expandedMap={expandedMap}
                  onToggleExpand={onToggleExpand}
                  searchQuery={searchQuery}
                  onUpdateValue={onUpdateValue}
                  onDeleteNode={onDeleteNode}
                  onAddChild={onAddChild}
                  onSelectPath={onSelectPath}
                />
              ))}
        </div>
      )}
    </div>
  );
};
