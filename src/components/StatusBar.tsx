"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Wand2,
  Lock,
  ChevronDown,
} from "lucide-react";
import { JsonStats } from "@/lib/json-parser";

interface StatusBarProps {
  isValid: boolean;
  errorMessage?: string;
  errorLine?: number;
  errorColumn?: number;
  stats: JsonStats;
  indentation: number | string;
  onChangeIndentation: (indent: number | string) => void;
  onAutoRepair: () => void;
  onJumpToError?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  isValid,
  errorMessage,
  errorLine,
  errorColumn,
  stats,
  indentation,
  onChangeIndentation,
  onAutoRepair,
  onJumpToError,
}) => {
  const [isIndentMenuOpen, setIsIndentMenuOpen] = useState(false);
  const indentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        indentMenuRef.current &&
        !indentMenuRef.current.contains(event.target as Node)
      ) {
        setIsIndentMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const indentLabel =
    indentation === "\t"
      ? "Tab Size: 1"
      : indentation === 0
      ? "Minified"
      : `Spaces: ${indentation}`;

  return (
    <footer
      className="h-6 flex items-center justify-between px-2 text-[11px] font-mono text-white select-none flex-shrink-0 z-20 cursor-default"
      style={{
        backgroundColor: isValid ? "var(--bg-statusbar)" : "#b91c1c",
      }}
    >
      {/* Left items: Validity, Error indicator, Repair */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {isValid ? (
          <div className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-white" />
            <span className="font-semibold">Valid JSON</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-300 animate-pulse" />
            <span
              onClick={onJumpToError}
              className="font-semibold cursor-pointer underline hover:text-amber-200 truncate max-w-[280px]"
              title={errorMessage}
            >
              Syntax Error {errorLine !== undefined ? `at Ln ${errorLine}, Col ${errorColumn || 1}` : ""}: {errorMessage}
            </span>

            <button
              onClick={onAutoRepair}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-red-900 font-bold hover:bg-amber-100 transition-colors shadow-sm ml-1"
              title="Click to automatically repair this JSON"
            >
              <Wand2 size={11} />
              <span>Repair Now</span>
            </button>
          </div>
        )}

        <div className="h-3 w-[1px] bg-white/30 mx-1" />

        {/* Structural Metrics */}
        <span className="hidden sm:inline opacity-90">{stats.formattedSize}</span>
        <span className="hidden md:inline opacity-90">• {stats.lineCount.toLocaleString()} Lines</span>
        <span className="hidden lg:inline opacity-90">• {stats.totalKeys.toLocaleString()} Keys</span>
        <span className="hidden xl:inline opacity-90">• Depth {stats.maxDepth}</span>
      </div>

      {/* Right items: Indentation, Encoding, Privacy */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Indentation selector dropdown */}
        <div className="relative" ref={indentMenuRef}>
          <button
            onClick={() => setIsIndentMenuOpen(!isIndentMenuOpen)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/20 transition-colors text-white"
          >
            <span>{indentLabel}</span>
            <ChevronDown size={11} />
          </button>

          {isIndentMenuOpen && (
            <div
              className="absolute bottom-6 right-0 mb-1 w-36 rounded shadow-xl border py-1 z-50 text-[12px] bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]"
            >
              <button
                onClick={() => {
                  onChangeIndentation(2);
                  setIsIndentMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[var(--bg-hover)]"
              >
                2 Spaces (Standard)
              </button>
              <button
                onClick={() => {
                  onChangeIndentation(4);
                  setIsIndentMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[var(--bg-hover)]"
              >
                4 Spaces
              </button>
              <button
                onClick={() => {
                  onChangeIndentation("\t");
                  setIsIndentMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[var(--bg-hover)]"
              >
                Tab
              </button>
              <button
                onClick={() => {
                  onChangeIndentation(0);
                  setIsIndentMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1 hover:bg-[var(--bg-hover)]"
              >
                Compact (Minified)
              </button>
            </div>
          )}
        </div>

        <span className="hidden sm:inline opacity-90">UTF-8</span>

        {/* Privacy badge */}
        <div
          className="flex items-center gap-1 opacity-90"
          title="All parsing, diffing, and conversions happen 100% locally in your browser"
        >
          <Lock size={11} />
          <span className="hidden md:inline">100% Client-Side</span>
        </div>
      </div>
    </footer>
  );
};
