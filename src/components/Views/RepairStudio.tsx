"use client";

import React, { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  Wand2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AppTheme } from "@/types";
import { repairJsonString, parseJson, formatJson } from "@/lib/json-parser";
import { SAMPLE_DATASETS } from "@/lib/sample-data";

interface RepairStudioProps {
  currentJsonText: string;
  onApplyRepaired: (repairedText: string) => void;
  theme: AppTheme;
}

export const RepairStudio: React.FC<RepairStudioProps> = ({
  currentJsonText,
  onApplyRepaired,
  theme,
}) => {
  const [inputText, setInputText] = useState(currentJsonText);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"input" | "repaired">("repaired");

  // Attempt repair
  const repairResult = useMemo(() => {
    const originalCheck = parseJson(inputText);
    const repaired = repairJsonString(inputText);
    const repairedCheck = parseJson(repaired.repaired);

    return {
      isOriginalValid: originalCheck.valid,
      originalError: originalCheck.error,
      isRepairedValid: repairedCheck.valid,
      repairedText: formatJson(repairedCheck.data, 2),
      repairSuccess: repaired.success && repairedCheck.valid,
    };
  }, [inputText]);

  const handleApply = () => {
    if (repairResult.repairSuccess) {
      onApplyRepaired(repairResult.repairedText);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleLoadBrokenSample = () => {
    const sample = SAMPLE_DATASETS.find((s) => s.id === "malformed-json");
    if (sample) {
      setInputText(String(sample.data));
    }
  };

  const handleCopyRepaired = () => {
    navigator.clipboard.writeText(repairResult.repairedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const monacoTheme = theme === "vscode-light" ? "vs" : "vs-dark";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Repair Toolbar */}
      <div
        className="h-10 flex items-center justify-between border-b text-xs select-none flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-subtle)",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-400 mr-1">
            <Wand2 size={14} />
            <span>AI / Smart JSON Repair</span>
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={handleLoadBrokenSample}
            title="Load an example with unquoted keys and trailing commas"
            className="text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            Load Broken Sample
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {repairResult.repairSuccess && (
            <button
              onClick={handleApply}
              className="flex items-center gap-2 text-xs rounded-md bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 font-semibold transition-all shadow-xs flex-shrink-0"
              style={{
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingTop: "5px",
                paddingBottom: "5px",
              }}
            >
              <Sparkles size={14} />
              <span>Apply Fix to Workspace</span>
            </button>
          )}

          <button
            onClick={handleCopyRepaired}
            className="flex items-center gap-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium text-xs flex-shrink-0"
            style={{
              paddingLeft: "11px",
              paddingRight: "11px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>Copy Repaired</span>
          </button>
        </div>
      </div>

      {/* Mobile Segmented Toggle */}
      <div className="flex md:hidden items-center justify-center p-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center rounded-lg bg-[var(--bg-primary)] p-0.5 border border-[var(--border-color)] w-full max-w-xs">
          <button
            onClick={() => setMobileTab("input")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "input"
                ? "bg-[var(--accent-primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <span>Raw Input</span>
          </button>
          <button
            onClick={() => setMobileTab("repaired")}
            className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "repaired"
                ? "bg-[var(--accent-primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <span>✨ Repaired JSON</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Broken Input vs Repaired Output */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Broken Input */}
        <div
          className={`w-full md:w-1/2 flex flex-col md:border-r border-[var(--border-color)] h-full ${
            mobileTab === "input" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-red-400">
              <AlertTriangle size={13} />
              <span>Malformed / Raw Input</span>
            </div>
            {repairResult.originalError && (
              <span className="text-[11px] text-red-300 font-mono truncate max-w-[200px]">
                Ln {repairResult.originalError.line || 1}: {repairResult.originalError.message}
              </span>
            )}
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language="json"
              theme={monacoTheme}
              value={inputText}
              onChange={(val) => setInputText(val || "")}
              options={{
                fontSize: 12,
                lineHeight: 18,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                minimap: { enabled: false },
                wordWrap: "on",
              }}
            />
          </div>
        </div>

        {/* Right: Repaired Output */}
        <div
          className={`w-full md:w-1/2 flex flex-col bg-[var(--bg-primary)] h-full ${
            mobileTab === "repaired" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Repaired & Validated JSON</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">100% Syntax Fixed</span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language="json"
              theme={monacoTheme}
              value={repairResult.repairedText}
              options={{
                readOnly: true,
                fontSize: 12,
                lineHeight: 18,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                minimap: { enabled: false },
                wordWrap: "on",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
