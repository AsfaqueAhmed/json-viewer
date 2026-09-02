"use client";

import React, { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  Copy,
  Check,
  Download,
  BookOpen,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AppTheme } from "@/types";
import {
  QueryEngine,
  QUERY_RECIPES,
  executeJsonPath,
  executeJavaScriptQuery,
  QueryResult,
} from "@/lib/json-query";
import { formatJson } from "@/lib/json-parser";

interface QueryStudioProps {
  data: unknown;
  theme: AppTheme;
}

export const QueryStudio: React.FC<QueryStudioProps> = ({ data, theme }) => {
  const [engine, setEngine] = useState<QueryEngine>("jsonpath");
  const [query, setQuery] = useState("$..*");
  const [copied, setCopied] = useState(false);

  // Default query based on engine
  const handleEngineChange = (newEngine: QueryEngine) => {
    setEngine(newEngine);
    if (newEngine === "jsonpath") {
      setQuery("$..*");
    } else {
      setQuery(`(data) => {\n  // Transform or filter data\n  return data;\n}`);
    }
  };

  const queryResult: QueryResult = useMemo(() => {
    if (!data) return { success: false, data: null, executionTimeMs: 0, error: "No input data provided" };
    if (engine === "jsonpath") {
      return executeJsonPath(data, query);
    } else {
      return executeJavaScriptQuery(data, query);
    }
  }, [data, query, engine]);

  const outputFormatted = useMemo(() => {
    if (!queryResult.success) return `// Error during query execution:\n// ${queryResult.error}`;
    return formatJson(queryResult.data, 2);
  }, [queryResult]);

  const handleApplyRecipe = (recipeQuery: string, recipeEngine: QueryEngine) => {
    setEngine(recipeEngine);
    setQuery(recipeQuery);
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(outputFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadResult = () => {
    const blob = new Blob([outputFormatted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_result_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monacoTheme = theme === "vscode-light" ? "vs" : "vs-dark";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Studio Header Toolbar */}
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
          {/* Engine Selector */}
          <div className="flex items-center rounded p-0.5 bg-[var(--bg-input)] border border-[var(--border-color)]">
            <button
              onClick={() => handleEngineChange("jsonpath")}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors ${
                engine === "jsonpath"
                  ? "bg-[var(--accent-primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              JSONPath
            </button>
            <button
              onClick={() => handleEngineChange("javascript")}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors ${
                engine === "javascript"
                  ? "bg-[var(--accent-primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              JavaScript / Lodash
            </button>
          </div>

          {/* Status Badge */}
          {queryResult.success ? (
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <CheckCircle2 size={13} />
              <span>Matched ({queryResult.resultCount ?? 1} results in {queryResult.executionTimeMs}ms)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400 font-mono text-[11px]">
              <AlertCircle size={13} />
              <span>Query Error</span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyResult}
            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy Output"}</span>
          </button>

          <button
            onClick={handleDownloadResult}
            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Editor Query Console + Live Output & Recipe Shelf */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Query Editor & Recipes */}
        <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-[var(--border-color)]">
          {/* Query Input Box */}
          <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {engine === "jsonpath" ? "JSONPath Expression" : "JavaScript Function / Transformer"}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">Live evaluation</span>
          </div>

          <div className="h-44 md:h-52 relative border-b border-[var(--border-color)]">
            <Editor
              height="100%"
              language={engine === "javascript" ? "javascript" : "text"}
              theme={monacoTheme}
              value={query}
              onChange={(val) => setQuery(val || "")}
              options={{
                fontSize: 12,
                lineHeight: 18,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
              }}
            />
          </div>

          {/* Quick Recipe Library */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-secondary)]">
            <div className="px-3 py-1.5 border-b border-[var(--border-subtle)] flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
              <BookOpen size={13} className="text-amber-400" />
              <span>Query Recipes & Snippets</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-xs">
              {QUERY_RECIPES.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleApplyRecipe(recipe.query, recipe.engine)}
                  className="w-full text-left p-2 rounded hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex flex-col gap-1 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-primary)] group-hover:text-white">
                      {recipe.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--accent-primary)] font-bold uppercase">
                      {recipe.engine}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-sans">
                    {recipe.description}
                  </span>
                  <code className="text-[10px] text-[var(--json-key)] truncate max-w-full">
                    {recipe.query.replace(/\n/g, " ")}
                  </code>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Monaco Result Output */}
        <div className="w-full md:w-1/2 flex flex-col bg-[var(--bg-primary)]">
          <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Transformed Output
            </span>
            {queryResult.error && (
              <span className="text-[11px] text-red-400 truncate max-w-[220px]">
                {queryResult.error}
              </span>
            )}
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language="json"
              theme={monacoTheme}
              value={outputFormatted}
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
