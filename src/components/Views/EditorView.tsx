"use client";

import React, { useRef, useState, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  Sparkles,
  Minimize2,
  ArrowDownAZ,
  Wand2,
  Copy,
  Check,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { AppTheme } from "@/types";
import { JsonStats } from "@/lib/json-parser";

interface EditorViewProps {
  value: string;
  onChange: (value: string) => void;
  theme: AppTheme;
  isValid: boolean;
  stats: JsonStats;
  onFormat: () => void;
  onMinify: () => void;
  onSortKeys: () => void;
  onRepair: () => void;
  onTransformKeysCase: (format: "camel" | "snake" | "kebab" | "pascal") => void;
  onRemoveNulls: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  value,
  onChange,
  theme,
  isValid,
  stats,
  onFormat,
  onMinify,
  onSortKeys,
  onRepair,
  onTransformKeysCase,
  onRemoveNulls,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<editor.FindMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  const monacoTheme = theme === "vscode-light" ? "vs" : "vs-dark";

  // Perform live partial key/value searching in Monaco
  useEffect(() => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model || !searchQuery.trim()) {
      setMatches([]);
      setCurrentMatchIndex(0);
      if (editorRef.current && decorationsRef.current.length > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      return;
    }

    // Find all partial matching keys or values (case-insensitive)
    const found = model.findMatches(searchQuery, false, false, false, null, true);
    setMatches(found);

    if (found.length > 0) {
      setCurrentMatchIndex(0);
      editorRef.current.revealRangeInCenter(found[0].range);
      editorRef.current.setSelection(found[0].range);

      const newDecorations = found.map((m, idx) => ({
        range: m.range,
        options: {
          isWholeLine: false,
          className: idx === 0 ? "monaco-search-current-match" : "monaco-search-match",
          overviewRuler: {
            color: "rgba(234, 179, 8, 0.7)",
            position: 4,
          },
        },
      }));
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
    } else {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [searchQuery, value]);

  const handleNextMatch = () => {
    if (matches.length === 0 || !editorRef.current) return;
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIdx);
    const target = matches[nextIdx];
    editorRef.current.revealRangeInCenter(target.range);
    editorRef.current.setSelection(target.range);

    const updated = matches.map((m, idx) => ({
      range: m.range,
      options: {
        isWholeLine: false,
        className: idx === nextIdx ? "monaco-search-current-match" : "monaco-search-match",
        overviewRuler: {
          color: "rgba(234, 179, 8, 0.7)",
          position: 4,
        },
      },
    }));
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, updated);
  };

  const handlePrevMatch = () => {
    if (matches.length === 0 || !editorRef.current) return;
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIdx);
    const target = matches[prevIdx];
    editorRef.current.revealRangeInCenter(target.range);
    editorRef.current.setSelection(target.range);

    const updated = matches.map((m, idx) => ({
      range: m.range,
      options: {
        isWholeLine: false,
        className: idx === prevIdx ? "monaco-search-current-match" : "monaco-search-match",
        overviewRuler: {
          color: "rgba(234, 179, 8, 0.7)",
          position: 4,
        },
      },
    }));
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, updated);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Editor Action Toolbar */}
      <div
        className="h-10 flex items-center justify-between border-b text-xs select-none flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        {/* Left Formatting Tools */}
        <div className="flex items-center overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={onFormat}
            title="Format / Beautify (Shift+Alt+F)"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Sparkles size={14} className="text-emerald-400" />
            <span>Beautify</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={onMinify}
            title="Minify JSON (remove whitespace)"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Minimize2 size={14} />
            <span>Minify</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={onSortKeys}
            title="Sort Keys Alphabetically"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <ArrowDownAZ size={14} />
            <span>Sort Keys</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          {/* Transform Keys Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCaseMenuOpen(!isCaseMenuOpen)}
              className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
              style={{
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingTop: "5px",
                paddingBottom: "5px",
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Key Case</span>
              <ChevronDown size={11} />
            </button>

            {isCaseMenuOpen && (
              <div
                className="absolute left-0 mt-1.5 w-36 rounded-md shadow-2xl border py-1.5 z-50 bg-[var(--bg-secondary)] border-[var(--border-color)] text-xs text-[var(--text-primary)] animate-slide-down"
              >
                <button
                  onClick={() => {
                    onTransformKeysCase("camel");
                    setIsCaseMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--bg-hover)]"
                >
                  camelCase
                </button>
                <button
                  onClick={() => {
                    onTransformKeysCase("snake");
                    setIsCaseMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--bg-hover)]"
                >
                  snake_case
                </button>
                <button
                  onClick={() => {
                    onTransformKeysCase("kebab");
                    setIsCaseMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--bg-hover)]"
                >
                  kebab-case
                </button>
                <button
                  onClick={() => {
                    onTransformKeysCase("pascal");
                    setIsCaseMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-[var(--bg-hover)]"
                >
                  PascalCase
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={onRemoveNulls}
            title="Remove null and empty fields"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <span>Strip Nulls</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center mx-2" />

          {/* Search Key or Value in Editor */}
          <div
            className="h-7 flex items-center gap-2 bg-[var(--bg-input)] rounded-md border border-[var(--border-color)] focus-within:border-[var(--accent-primary)] transition-all flex-shrink-0 mx-1.5"
            style={{ paddingLeft: "6px", paddingRight: "6px" }}
          >
            <Search size={13} className="text-[var(--text-muted)] flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.shiftKey) handlePrevMatch();
                  else handleNextMatch();
                } else if (e.key === "Escape") {
                  setSearchQuery("");
                }
              }}
              placeholder="Search key or value..."
              className="bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none w-36 sm:w-48 font-mono h-full px-1"
            />
            {searchQuery && (
              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono ml-1.5">
                <span>
                  {matches.length > 0 ? `${currentMatchIndex + 1}/${matches.length}` : "0/0"}
                </span>
                <button
                  onClick={handlePrevMatch}
                  disabled={matches.length === 0}
                  className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] disabled:opacity-40"
                  title="Previous Match (Shift+Enter)"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={handleNextMatch}
                  disabled={matches.length === 0}
                  className="p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] disabled:opacity-40"
                  title="Next Match (Enter)"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-red-400"
                  title="Clear search (Esc)"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {!isValid && (
            <>
              <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />
              <button
                onClick={onRepair}
                className="flex items-center gap-2 text-xs rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition-all font-medium flex-shrink-0"
                style={{
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  paddingTop: "5px",
                  paddingBottom: "5px",
                }}
              >
                <Wand2 size={14} />
                <span>Auto-Repair Error</span>
              </button>
            </>
          )}
        </div>

        {/* Right Stats & Copy */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
            <span>{stats.charCount.toLocaleString()} chars</span>
            <span>•</span>
            <span>{stats.lineCount.toLocaleString()} lines</span>
            <span>•</span>
            <span>{stats.formattedSize}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all flex-shrink-0 font-medium text-xs"
            style={{
              paddingLeft: "11px",
              paddingRight: "11px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 relative w-full h-full">
        <Editor
          height="100%"
          language="json"
          theme={monacoTheme}
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorDidMount}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: true, maxColumn: 80 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
            folding: true,
            tabSize: 2,
            renderWhitespace: "selection",
            suggest: {
              showWords: true,
            },
          }}
        />
      </div>
    </div>
  );
};
