"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Copy,
  Search,
  Check,
  ChevronDown,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface BreadcrumbsProps {
  currentPath: string[];
  onSelectPath?: (path: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchCount?: number;
  activeMatchIndex?: number;
  onNextMatch?: () => void;
  onPrevMatch?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentPath,
  onSelectPath,
  searchQuery,
  onSearchChange,
  matchCount = 0,
  activeMatchIndex = 0,
  onNextMatch,
  onPrevMatch,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [isCopyDropdownOpen, setIsCopyDropdownOpen] = useState(false);

  const getDotPath = () => {
    if (!currentPath.length) return "$";
    return currentPath
      .map((seg, idx) => (/^\d+$/.test(seg) ? `[${seg}]` : idx === 0 ? seg : `.${seg}`))
      .join("");
  };

  const getBracketPath = () => {
    if (!currentPath.length) return "[]";
    return currentPath
      .map((seg) => (/^\d+$/.test(seg) ? `[${seg}]` : `["${seg}"]`))
      .join("");
  };

  const getJsonPath = () => {
    return `$${getDotPath().startsWith("[") ? "" : "."}${getDotPath()}`;
  };

  const getJsonPointer = () => {
    if (!currentPath.length) return "/";
    return `/${currentPath.join("/")}`;
  };

  const handleCopyPath = (format: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedFormat(format);
    setIsCopyDropdownOpen(false);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div
      className="h-9 flex items-center justify-between border-b text-xs font-mono select-none flex-shrink-0 z-10"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-subtle)",
        paddingLeft: "12px",
        paddingRight: "12px",
      }}
    >
      {/* Breadcrumb path segments with clean spacing */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[var(--text-secondary)]">
        <span
          onClick={() => onSelectPath?.([])}
          className="hover:text-[var(--text-primary)] cursor-pointer px-1.5 py-0.5 rounded hover:bg-[var(--bg-hover)] text-emerald-500 font-semibold"
        >
          root
        </span>

        {currentPath.map((segment, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight size={12} className="text-[var(--text-muted)] flex-shrink-0" />
            <span
              onClick={() => onSelectPath?.(currentPath.slice(0, idx + 1))}
              className={`hover:text-[var(--text-primary)] cursor-pointer px-1.5 py-0.5 rounded hover:bg-[var(--bg-hover)] truncate max-w-[140px] ${
                idx === currentPath.length - 1 ? "text-[var(--json-key)] font-medium" : ""
              }`}
            >
              {/^\d+$/.test(segment) ? `[${segment}]` : segment}
            </span>
          </React.Fragment>
        ))}

        {/* Copy Path Dropdown */}
        {currentPath.length > 0 && (
          <div className="relative ml-2.5 flex-shrink-0">
            <button
              onClick={() => setIsCopyDropdownOpen(!isCopyDropdownOpen)}
              title="Copy JSON Path"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
            >
              {copiedFormat ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              <span>{copiedFormat ? "Copied!" : "Path"}</span>
              <ChevronDown size={10} />
            </button>

            {isCopyDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-60 rounded-md shadow-2xl border py-1.5 z-50 animate-slide-down bg-[var(--bg-secondary)] border-[var(--border-color)]"
              >
                <button
                  onClick={() => handleCopyPath("dot", getDotPath())}
                  className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex justify-between items-center"
                >
                  <span>Dot Notation:</span>
                  <code className="text-[10px] text-[var(--json-key)]">{getDotPath()}</code>
                </button>
                <button
                  onClick={() => handleCopyPath("jsonpath", getJsonPath())}
                  className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex justify-between items-center"
                >
                  <span>JSONPath:</span>
                  <code className="text-[10px] text-[var(--json-key)]">{getJsonPath()}</code>
                </button>
                <button
                  onClick={() => handleCopyPath("pointer", getJsonPointer())}
                  className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex justify-between items-center"
                >
                  <span>JSON Pointer:</span>
                  <code className="text-[10px] text-[var(--json-key)]">{getJsonPointer()}</code>
                </button>
                <button
                  onClick={() => handleCopyPath("bracket", getBracketPath())}
                  className="w-full text-left px-3.5 py-1.5 text-xs hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex justify-between items-center"
                >
                  <span>Bracket:</span>
                  <code className="text-[10px] text-[var(--json-key)]">{getBracketPath()}</code>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Real-time Search Box */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded border transition-colors bg-[var(--bg-input)]"
          style={{ borderColor: "var(--border-color)" }}
        >
          <Search size={12} className="text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter keys/values..."
            className="bg-transparent border-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none w-32 sm:w-44 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {searchQuery && matchCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-mono">
            <span>
              {activeMatchIndex + 1}/{matchCount}
            </span>
            <button
              onClick={onPrevMatch}
              title="Previous Match (Shift+Enter)"
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowUp size={12} />
            </button>
            <button
              onClick={onNextMatch}
              title="Next Match (Enter)"
              className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
