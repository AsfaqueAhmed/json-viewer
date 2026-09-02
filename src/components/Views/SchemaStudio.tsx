"use client";

import React, { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  ShieldCheck,
  ShieldAlert,
  Wand2,
  Dice5,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AppTheme } from "@/types";
import {
  validateJsonAgainstSchema,
  generateJsonSchema,
  generateMockDataFromSchema,
  ValidationResult,
} from "@/lib/json-schema";
import { parseJson, formatJson } from "@/lib/json-parser";
import { SAMPLE_DATASETS } from "@/lib/sample-data";

interface SchemaStudioProps {
  currentJsonText: string;
  onUpdateJsonText: (text: string) => void;
  theme: AppTheme;
}

export const SchemaStudio: React.FC<SchemaStudioProps> = ({
  currentJsonText,
  onUpdateJsonText,
  theme,
}) => {
  const [schemaText, setSchemaText] = useState(() => {
    const userSchema = SAMPLE_DATASETS.find((s) => s.id === "user-schema");
    return userSchema ? formatJson(userSchema.data) : "{\n  \"type\": \"object\"\n}";
  });

  const [copiedSchema, setCopiedSchema] = useState(false);

  // Validate JSON against Schema
  const validationResult: ValidationResult = useMemo(() => {
    const dataParsed = parseJson(currentJsonText);
    const schemaParsed = parseJson(schemaText);

    if (!dataParsed.valid) {
      return {
        valid: false,
        errors: [{ instancePath: "", schemaPath: "", keyword: "syntax", message: "Data contains invalid JSON syntax", params: {} }],
        errorCount: 1,
      };
    }

    if (!schemaParsed.valid) {
      return {
        valid: false,
        errors: [{ instancePath: "", schemaPath: "", keyword: "schema_syntax", message: "Schema contains invalid JSON syntax", params: {} }],
        errorCount: 1,
      };
    }

    return validateJsonAgainstSchema(dataParsed.data, schemaParsed.data);
  }, [currentJsonText, schemaText]);

  const handleGenerateSchema = () => {
    const parsed = parseJson(currentJsonText);
    if (!parsed.valid || parsed.data === null) return;
    const generated = generateJsonSchema(parsed.data);
    setSchemaText(formatJson(generated));
  };

  const handleGenerateMockData = () => {
    const parsed = parseJson(schemaText);
    if (!parsed.valid || !parsed.data) return;
    const mock = generateMockDataFromSchema(parsed.data);
    onUpdateJsonText(formatJson(mock));
  };

  const handleValidateWithCelebration = () => {
    if (validationResult.valid) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 1500);
  };

  const monacoTheme = theme === "vscode-light" ? "vs" : "vs-dark";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Schema Toolbar */}
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
          <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--text-primary)] mr-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Schema Validator</span>
          </div>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={handleGenerateSchema}
            title="Derive JSON Schema automatically from data"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Wand2 size={14} className="text-amber-400" />
            <span>Generate Schema</span>
          </button>

          <div className="h-4 w-[1px] bg-[var(--border-color)] opacity-70 flex-shrink-0 self-center" />

          <button
            onClick={handleGenerateMockData}
            title="Synthesize mock JSON data from current schema"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Dice5 size={14} />
            <span className="hidden sm:inline">Mock Data</span>
          </button>
        </div>

        {/* Validation Status Badge */}
        <div className="flex items-center gap-2">
          {validationResult.valid ? (
            <button
              onClick={handleValidateWithCelebration}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Valid Schema</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
              <ShieldAlert size={13} />
              <span>{validationResult.errorCount} Schema Violations</span>
            </div>
          )}

          <button
            onClick={handleCopySchema}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
          >
            {copiedSchema ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span className="hidden sm:inline">Copy Schema</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: JSON Data (Left) + JSON Schema (Right) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: JSON Data */}
        <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-[var(--border-color)]">
          <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span>Target JSON Payload</span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">Editable</span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language="json"
              theme={monacoTheme}
              value={currentJsonText}
              onChange={(val) => onUpdateJsonText(val || "")}
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

        {/* Right: JSON Schema & Violations List */}
        <div className="w-full md:w-1/2 flex flex-col bg-[var(--bg-primary)]">
          <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span>JSON Schema Definition (Draft-07)</span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">Draft-07 / 2020-12</span>
          </div>

          <div className="h-[60%] relative border-b border-[var(--border-color)]">
            <Editor
              height="100%"
              language="json"
              theme={monacoTheme}
              value={schemaText}
              onChange={(val) => setSchemaText(val || "")}
              options={{
                fontSize: 12,
                lineHeight: 18,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                minimap: { enabled: false },
                wordWrap: "on",
              }}
            />
          </div>

          {/* Violations Details Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-secondary)]">
            <div className="p-2 border-b border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between">
              <span>Validation Output</span>
              {validationResult.errors.length > 0 && (
                <span className="text-red-400 font-mono text-[11px]">
                  {validationResult.errors.length} errors
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
              {validationResult.valid ? (
                <div className="flex items-center gap-2 p-3 text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Payload completely satisfies all schema constraints!</span>
                </div>
              ) : (
                validationResult.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300 flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        Path: {err.instancePath || "/ (root)"}
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-red-900/50 text-red-200 uppercase font-bold">
                        {err.keyword}
                      </span>
                    </div>
                    <span className="text-[11px] text-red-200">{err.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
