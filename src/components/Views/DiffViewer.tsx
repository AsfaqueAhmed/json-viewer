"use client";

import React, { useState, useMemo, useRef } from "react";
import { DiffEditor } from "@monaco-editor/react";
import {
  GitCompare,
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ClipboardPaste,
  Upload,
  Trash2,
} from "lucide-react";
import { AppTheme, DocumentTab } from "@/types";
import { computeJsonDiff } from "@/lib/json-diff";
import { parseJson, formatJson } from "@/lib/json-parser";

interface DiffViewerProps {
  currentJsonText: string;
  onUpdateJsonText?: (newText: string) => void;
  tabs?: DocumentTab[];
  theme: AppTheme;
}

// Module-level in-memory cache so compare state is retained across view changes without being lost
const diffMemoryCache = {
  originalText: "",
  modifiedText: "",
  diffFilter: "all" as "all" | "added" | "removed" | "modified",
  ignoreKeyOrder: true,
  isInitialized: false,
};

export const DiffViewer: React.FC<DiffViewerProps> = ({
  currentJsonText,
  onUpdateJsonText,
  theme,
}) => {
  // Original (Left) is always the active JSON currently open in the Monaco editor
  const [originalText, setOriginalTextState] = useState<string>(() => {
    const initial = currentJsonText || "{}";
    diffMemoryCache.originalText = initial;
    return initial;
  });

  // Keep Original (Left) in sync whenever the active editor JSON or tab changes.
  // Must run in an effect: it mutates the module-level diffMemoryCache, which
  // is a side effect and not safe to do during render.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (currentJsonText && currentJsonText !== diffMemoryCache.originalText) {
      setOriginalTextState(currentJsonText);
      diffMemoryCache.originalText = currentJsonText;
    }
  }, [currentJsonText]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Modified (Right) is initially identical to the Original (Editor JSON)
  const [modifiedText, setModifiedTextState] = useState<string>(() => {
    if (diffMemoryCache.isInitialized && diffMemoryCache.modifiedText) {
      return diffMemoryCache.modifiedText;
    }
    const initial = currentJsonText || "{}";
    diffMemoryCache.modifiedText = initial;
    diffMemoryCache.isInitialized = true;
    return initial;
  });

  const setOriginalText = (text: string, syncToWorkspace = true) => {
    diffMemoryCache.originalText = text;
    diffMemoryCache.isInitialized = true;
    setOriginalTextState(text);
    if (syncToWorkspace && onUpdateJsonText) {
      onUpdateJsonText(text);
    }
  };

  const setModifiedText = (text: string) => {
    diffMemoryCache.modifiedText = text;
    diffMemoryCache.isInitialized = true;
    setModifiedTextState(text);
  };

  const [diffFilter, setDiffFilterState] = useState<"all" | "added" | "removed" | "modified">(
    diffMemoryCache.diffFilter
  );
  const [isInlineDiff, setIsInlineDiff] = useState(false);
  const setDiffFilter = (filter: "all" | "added" | "removed" | "modified") => {
    diffMemoryCache.diffFilter = filter;
    setDiffFilterState(filter);
  };

  const [ignoreKeyOrder] = useState<boolean>(
    diffMemoryCache.ignoreKeyOrder
  );

  // Hidden File Inputs
  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // Compute semantic differences
  const diffResult = useMemo(() => {
    const leftParsed = parseJson(originalText);
    const rightParsed = parseJson(modifiedText);

    if (!leftParsed.valid || !rightParsed.valid) {
      return null;
    }

    return computeJsonDiff(leftParsed.data, rightParsed.data, { ignoreKeyOrder });
  }, [originalText, modifiedText, ignoreKeyOrder]);

  const filteredDiffs = useMemo(() => {
    if (!diffResult) return [];
    if (diffFilter === "all") return diffResult.diffs;
    return diffResult.diffs.filter((d) => {
      if (diffFilter === "added") return d.type === "added";
      if (diffFilter === "removed") return d.type === "removed";
      if (diffFilter === "modified") return d.type === "modified" || d.type === "type_changed";
      return true;
    });
  }, [diffResult, diffFilter]);

  // Paste handlers
  const handlePasteLeft = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        const parsed = parseJson(text);
        setOriginalText(parsed.valid ? formatJson(parsed.data, 2) : text, true);
      }
    } catch {
      // Fallback
    }
  };

  const handlePasteRight = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        const parsed = parseJson(text);
        setModifiedText(parsed.valid ? formatJson(parsed.data, 2) : text);
      }
    } catch {
      // Fallback
    }
  };

  // Upload file handlers
  const handleLeftFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || "";
      const parsed = parseJson(text);
      setOriginalText(parsed.valid ? formatJson(parsed.data, 2) : text, true);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRightFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || "";
      const parsed = parseJson(text);
      setModifiedText(parsed.valid ? formatJson(parsed.data, 2) : text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText, true);
    setModifiedText(temp);
  };

  // Format handler
  const handleFormatBoth = () => {
    const leftParsed = parseJson(originalText);
    const rightParsed = parseJson(modifiedText);
    if (leftParsed.valid && leftParsed.data !== null) {
      setOriginalText(formatJson(leftParsed.data, 2), true);
    }
    if (rightParsed.valid && rightParsed.data !== null) {
      setModifiedText(formatJson(rightParsed.data, 2));
    }
  };

  const monacoTheme = theme === "vscode-light" ? "vs" : "vs-dark";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={leftFileInputRef}
        onChange={handleLeftFileUpload}
        accept=".json,.txt,.yaml"
        className="hidden"
      />
      <input
        type="file"
        ref={rightFileInputRef}
        onChange={handleRightFileUpload}
        accept=".json,.txt,.yaml"
        className="hidden"
      />

      {/* Main Top Diff Toolbar - Format only */}
      <div
        className="h-10 flex items-center justify-between border-b text-xs select-none flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {/* Left Actions */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text-primary)] mr-1">
            <GitCompare size={14} className="text-cyan-400" />
            <span>Semantic Diff</span>
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={handleSwap}
            title="Swap Left & Right"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <ArrowLeftRight size={13} />
            <span className="hidden sm:inline">Swap</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={handleFormatBoth}
            title="Format both JSON payloads (Shift+Alt+F)"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Sparkles size={13} className="text-emerald-400" />
            <span>Format</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={() => setIsInlineDiff(!isInlineDiff)}
            title={isInlineDiff ? "Switch to Side-by-Side Diff" : "Switch to Inline Diff (Mobile Friendly)"}
            className={`flex items-center gap-1.5 text-xs rounded-md transition-all font-medium flex-shrink-0 px-2.5 py-1 ${
              isInlineDiff
                ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/40 shadow-xs"
                : "hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
            }`}
          >
            <span>{isInlineDiff ? "Inline Mode" : "Split Mode"}</span>
          </button>
        </div>

        {/* Diff Summary Badges & Filter */}
        {diffResult && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] flex-shrink-0">
            {diffResult.summary.identical ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={12} /> Identical JSON
              </span>
            ) : (
              <>
                <button
                  onClick={() => setDiffFilter("all")}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    diffFilter === "all"
                      ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                      : "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
                  }`}
                >
                  All ({diffResult.summary.totalDiffs})
                </button>

                <button
                  onClick={() => setDiffFilter("added")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                    diffFilter === "added"
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  <PlusCircle size={11} /> +{diffResult.summary.added}
                </button>

                <button
                  onClick={() => setDiffFilter("removed")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                    diffFilter === "removed"
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  <MinusCircle size={11} /> -{diffResult.summary.removed}
                </button>

                <button
                  onClick={() => setDiffFilter("modified")}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                    diffFilter === "modified"
                      ? "bg-amber-600 text-white border-amber-500"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  <AlertCircle size={11} /> ~{diffResult.summary.modified + diffResult.summary.typeChanged}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Diff Layout: Side-by-Side Diff Editor (Left) + Detailed Inspector (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Monaco Side-by-Side Diff Editor with aligned sub-headers */}
        <div className="flex-1 flex flex-col h-[60%] lg:h-full border-b lg:border-b-0 lg:border-r border-[var(--border-color)] overflow-hidden">
          {/* Side-by-Side Sub Headers - Exactly matching Monaco Diff Editor left pane, center sash, and right pane */}
          <div
            className="h-8 flex border-b text-xs select-none flex-shrink-0"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-activity)" }}
          >
            {/* Left Side Header (Original) - Matches left editor width */}
            <div
              className="flex items-center justify-between border-r flex-shrink-0"
              style={{
                width: "calc(50% - 15px)",
                borderColor: "var(--border-color)",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-400 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Original (Editor JSON)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePasteLeft}
                  title="Paste JSON from clipboard into Left side"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] text-[11px] transition-colors"
                >
                  <ClipboardPaste size={11} />
                  <span>Paste</span>
                </button>

                <div className="h-3.5 w-[1px] bg-[var(--border-color)] opacity-60 flex-shrink-0" />

                <button
                  onClick={() => leftFileInputRef.current?.click()}
                  title="Upload file into Left side"
                  className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Upload size={12} />
                </button>

                <div className="h-3.5 w-[1px] bg-[var(--border-color)] opacity-60 flex-shrink-0" />

                <button
                  onClick={() => setOriginalText("{\n  \n}", true)}
                  title="Clear Left side"
                  className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Center Sash Spacer - Matches Monaco 30px Diff Sash */}
            <div
              className="w-[30px] border-r flex-shrink-0"
              style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-secondary)" }}
            />

            {/* Right Side Header (Modified) - Matches right editor width */}
            <div
              className="flex-1 flex items-center justify-between"
              style={{ paddingLeft: "12px", paddingRight: "12px" }}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Modified (Right)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePasteRight}
                  title="Paste JSON from clipboard into Right side"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] text-[11px] transition-colors"
                >
                  <ClipboardPaste size={11} />
                  <span>Paste</span>
                </button>

                <div className="h-3.5 w-[1px] bg-[var(--border-color)] opacity-60 flex-shrink-0" />

                <button
                  onClick={() => rightFileInputRef.current?.click()}
                  title="Upload file into Right side"
                  className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Upload size={12} />
                </button>

                <div className="h-3.5 w-[1px] bg-[var(--border-color)] opacity-60 flex-shrink-0" />

                <button
                  onClick={() => setModifiedText("{\n  \n}")}
                  title="Clear Right side"
                  className="p-1 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Side-by-Side Monaco Diff Editor */}
          <div className="flex-1 relative w-full h-full">
            <DiffEditor
              height="100%"
              original={originalText}
              modified={modifiedText}
              language="json"
              theme={monacoTheme}
              onMount={(diffEditor) => {
                const orig = diffEditor.getOriginalEditor();
                const mod = diffEditor.getModifiedEditor();

                orig.onDidChangeModelContent(() => {
                  const val = orig.getValue();
                  setOriginalText(val, true);
                });

                mod.onDidChangeModelContent(() => {
                  const val = mod.getValue();
                  setModifiedText(val);
                });
              }}
              options={{
                fontSize: 12,
                lineHeight: 19,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                readOnly: false,
                originalEditable: true,
                automaticLayout: true,
                renderSideBySide: !isInlineDiff,
                wordWrap: "on",
                minimap: { enabled: false },
              }}
            />
          </div>
        </div>

        {/* Structural Change List */}
        <div className="w-full lg:w-80 flex flex-col h-[40%] lg:h-full bg-[var(--bg-secondary)] overflow-hidden">
          <div
            className="h-8 px-3 border-b text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between flex-shrink-0"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-activity)" }}
          >
            <span>Detailed Key Changes</span>
            <span className="font-mono text-[11px]">{filteredDiffs.length} items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-xs">
            {filteredDiffs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-center p-4">
                <CheckCircle2 size={24} className="text-emerald-400 mb-1" />
                <p className="font-medium text-xs">No differences matching current filter.</p>
              </div>
            ) : (
              filteredDiffs.map((d) => (
                <div
                  key={d.id}
                  className="p-2 rounded border transition-colors flex flex-col gap-1"
                  style={{
                    backgroundColor:
                      d.type === "added"
                        ? "var(--diff-added-bg)"
                        : d.type === "removed"
                        ? "var(--diff-removed-bg)"
                        : "var(--diff-modified-bg)",
                    borderColor:
                      d.type === "added"
                        ? "var(--diff-added-border)"
                        : d.type === "removed"
                        ? "var(--diff-removed-border)"
                        : "var(--diff-modified-border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate max-w-[180px]" title={d.path}>
                      {d.path}
                    </span>
                    <span
                      className="text-[10px] uppercase px-1.5 py-0.2 rounded font-bold"
                      style={{
                        color:
                          d.type === "added"
                            ? "var(--diff-added-text)"
                            : d.type === "removed"
                            ? "var(--diff-removed-text)"
                            : "var(--diff-modified-text)",
                      }}
                    >
                      {d.type.replace("_", " ")}
                    </span>
                  </div>

                  {d.type === "removed" && (
                    <div className="text-[11px] text-[var(--diff-removed-text)] truncate">
                      - {JSON.stringify(d.leftValue)}
                    </div>
                  )}

                  {d.type === "added" && (
                    <div className="text-[11px] text-[var(--diff-added-text)] truncate">
                      + {JSON.stringify(d.rightValue)}
                    </div>
                  )}

                  {(d.type === "modified" || d.type === "type_changed") && (
                    <div className="text-[11px] flex flex-col gap-0.5">
                      <div className="text-[var(--diff-removed-text)] truncate">
                        - {JSON.stringify(d.leftValue)}
                      </div>
                      <div className="text-[var(--diff-added-text)] truncate">
                        + {JSON.stringify(d.rightValue)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
