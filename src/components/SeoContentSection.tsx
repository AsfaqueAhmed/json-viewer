"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCode2,
  GitCompare,
  CheckCircle2,
  Search,
  Wrench,
  ArrowRightLeft,
  Network,
  ShieldCheck,
  Zap,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Table,
  ArrowUpRight,
  ChevronUp,
  Cpu,
  Lock,
} from "lucide-react";
import { TOOLS_CONFIG } from "@/lib/seo-schemas";

interface SeoContentSectionProps {
  currentToolKey?: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function SeoContentSection({
  currentToolKey = "editor",
  isExpanded: controlledExpanded,
  onToggleExpanded,
}: SeoContentSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggleExpanded) {
      onToggleExpanded();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const toolsList = [
    {
      key: "editor",
      name: "JSON Viewer & Editor",
      badge: "Monaco Engine",
      path: "/",
      icon: FileCode2,
      description: "Monaco-powered JSON viewer, syntax highlighter, tree inspector, and formatter.",
    },
    {
      key: "diff",
      name: "JSON Diff & Compare",
      badge: "Semantic Diff",
      path: "/diff",
      icon: GitCompare,
      description: "Side-by-side semantic JSON difference comparison and visual merge tool.",
    },
    {
      key: "schema-validator",
      name: "JSON Schema Validator",
      badge: "AJV Draft-07",
      path: "/schema-validator",
      icon: CheckCircle2,
      description: "AJV-powered Draft-07 schema validation and automatic schema template generator.",
    },
    {
      key: "jsonpath",
      name: "JSONPath Query Studio",
      badge: "Live Querying",
      path: "/jsonpath",
      icon: Search,
      description: "Real-time JSONPath tester and query evaluator with selector cheat-sheet.",
    },
    {
      key: "converter",
      name: "JSON Converter",
      badge: "Type Generator",
      path: "/converter",
      icon: ArrowRightLeft,
      description: "Convert JSON to TypeScript interfaces, clean YAML, CSV spreadsheets, and XML.",
    },
    {
      key: "repair",
      name: "JSON Auto-Repair",
      badge: "Syntax Heuristics",
      path: "/repair",
      icon: Wrench,
      description: "Heuristic repair engine for malformed quotes, trailing commas, and missing braces.",
    },
    {
      key: "graph",
      name: "Node Graph Visualizer",
      badge: "Force-Directed",
      path: "/graph",
      icon: Network,
      description: "Interactive visual node hierarchy graph showing object-array relationships.",
    },
    {
      key: "table",
      name: "JSON Table Viewer",
      badge: "Grid View & CSV",
      path: "/table",
      icon: Table,
      description: "Tabular spreadsheet grid for viewing and sorting large JSON object arrays.",
    },
  ];

  // Aggregate FAQs from all tools for comprehensive search indexing
  const allFaqs = Object.values(TOOLS_CONFIG).flatMap((tool) => tool.faqs);

  return (
    <aside
      id="seo-guide-section"
      aria-label="JSON Studio Documentation and Developer Guide"
      className="border-t select-none"
      style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
    >
      <div style={{ paddingLeft: "16px", paddingRight: "16px", paddingTop: "24px", paddingBottom: "24px" }}>
        {/* Header / Expand & Collapse Control */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b"
          style={{ borderColor: "var(--border-color)", paddingBottom: "16px" }}
        >
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                color: "var(--accent-primary)",
                fontSize: "10px",
                paddingLeft: "8px",
                paddingRight: "8px",
                paddingTop: "3px",
                paddingBottom: "3px",
                marginBottom: "8px",
              }}
            >
              <Sparkles size={11} />
              <span>Modern Developer Suite</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Developer Tool Index &amp; Documentation
            </h2>
            <p className="text-xs mt-1 max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Fast, privacy-focused developer suite for inspecting, formatting, comparing, validating, and converting JSON payloads client-side.
            </p>
          </div>

          <button
            onClick={handleToggle}
            className="flex items-center gap-2 text-xs font-semibold rounded-md transition-colors cursor-pointer flex-shrink-0"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              paddingLeft: "12px",
              paddingRight: "10px",
              paddingTop: "7px",
              paddingBottom: "7px",
            }}
            aria-expanded={isExpanded}
            aria-label="Toggle developer documentation"
          >
            <span>{isExpanded ? "Close Documentation" : "Open Documentation & FAQ"}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              style={{ color: "var(--text-muted)" }}
            />
          </button>
        </div>

        {/* Expandable Content Area */}
        {isExpanded && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px", paddingTop: "24px" }}>
            {/* Section 1: Developer Tools Grid Matrix */}
            <section aria-labelledby="tools-matrix-heading">
              <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                <div className="flex items-center gap-1.5">
                  <Cpu size={14} style={{ color: "var(--accent-primary)" }} />
                  <h3 id="tools-matrix-heading" className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                    Developer Tools Matrix
                  </h3>
                </div>
                <span
                  className="text-[11px] font-mono rounded-md"
                  style={{
                    color: "var(--text-muted)",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-subtle)",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    paddingTop: "2px",
                    paddingBottom: "2px",
                  }}
                >
                  {toolsList.length} Tools Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {toolsList.map((tool) => {
                  const IconComponent = tool.icon;
                  const isCurrent = tool.key === currentToolKey;

                  return (
                    <Link
                      key={tool.key}
                      href={tool.path}
                      className="rounded-lg border transition-colors duration-150 flex flex-col justify-between group"
                      style={{
                        backgroundColor: isCurrent ? "var(--bg-tertiary)" : "var(--bg-primary)",
                        borderColor: isCurrent ? "var(--accent-primary)" : "var(--border-color)",
                        padding: "14px",
                        gap: "12px",
                      }}
                    >
                      {/* Top Row: Icon + Badge + Arrow */}
                      <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                          <div
                            className="rounded-md flex items-center justify-center flex-shrink-0"
                            style={{
                              width: "30px",
                              height: "30px",
                              backgroundColor: isCurrent ? "var(--accent-primary)" : "var(--bg-tertiary)",
                              color: isCurrent ? "#ffffff" : "var(--accent-primary)",
                            }}
                          >
                            <IconComponent size={15} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[10px] font-mono rounded-md"
                              style={{
                                backgroundColor: "var(--bg-secondary)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--text-muted)",
                                paddingLeft: "6px",
                                paddingRight: "6px",
                                paddingTop: "2px",
                                paddingBottom: "2px",
                              }}
                            >
                              {tool.badge}
                            </span>
                            <ArrowUpRight
                              size={14}
                              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                              style={{ color: "var(--text-muted)" }}
                            />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="font-semibold text-xs" style={{ color: "var(--text-primary)", marginBottom: "4px" }}>
                          {tool.name}
                        </h4>
                        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                          {tool.description}
                        </p>
                      </div>

                      {/* Card Footer Status */}
                      <div
                        className="flex items-center justify-between text-[11px] font-mono border-t"
                        style={{ borderColor: "var(--border-subtle)", paddingTop: "10px" }}
                      >
                        {isCurrent ? (
                          <div className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--accent-primary)" }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--accent-primary)" }} />
                            <span>Currently Active</span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>Launch Tool →</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Privacy Guarantee Banner Card */}
            <section
              className="rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ backgroundColor: "var(--bg-primary)", borderColor: "rgba(0,187,127,0.3)", padding: "16px" }}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className="rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    width: "38px",
                    height: "38px",
                    backgroundColor: "rgba(0,187,127,0.12)",
                    color: "var(--json-boolean, #4ec9b0)",
                    border: "1px solid rgba(0,187,127,0.3)",
                  }}
                >
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      100% Client-Side Privacy Architecture
                    </h4>
                    <span
                      className="text-[10px] uppercase font-mono font-bold rounded"
                      style={{
                        backgroundColor: "rgba(0,187,127,0.15)",
                        color: "#5ee9b5",
                        paddingLeft: "6px",
                        paddingRight: "6px",
                        paddingTop: "2px",
                        paddingBottom: "2px",
                      }}
                    >
                      No JSON Upload
                    </span>
                  </div>
                  <p className="text-xs mt-1 max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Your JSON never leaves your browser sandbox — all parsing, diffing, and conversion happens locally. We do use privacy-respecting, anonymous usage analytics (no ad tracking, no personal data) to improve the tools.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <span
                  className="inline-flex items-center rounded-md text-[11px] font-semibold"
                  style={{
                    backgroundColor: "rgba(0,122,204,0.1)",
                    color: "var(--accent-primary)",
                    border: "1px solid rgba(0,122,204,0.25)",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                  }}
                >
                  <Zap size={12} className="mr-1" /> WebAssembly Speed
                </span>
                <span
                  className="inline-flex items-center rounded-md text-[11px] font-semibold"
                  style={{
                    backgroundColor: "rgba(0,187,127,0.1)",
                    color: "#5ee9b5",
                    border: "1px solid rgba(0,187,127,0.25)",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                  }}
                >
                  <Lock size={12} className="mr-1" /> Zero Server Uploads
                </span>
              </div>
            </section>

            {/* Section 3: Frequently Asked Questions (FAQ) */}
            <section aria-labelledby="faq-heading">
              <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                <div className="flex items-center gap-1.5">
                  <HelpCircle size={14} style={{ color: "var(--accent-primary)" }} />
                  <h3 id="faq-heading" className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                    Frequently Asked Questions ({allFaqs.length})
                  </h3>
                </div>
                <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>Click to expand details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 select-text">
                {allFaqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group rounded-lg border transition-colors duration-150 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                    style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)", padding: "12px" }}
                  >
                    <summary className="flex items-start justify-between gap-3 font-semibold text-xs list-none select-none">
                      <span className="leading-snug" style={{ color: "var(--text-primary)" }}>
                        {faq.question}
                      </span>
                      <div
                        className="rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ width: "22px", height: "22px", backgroundColor: "var(--bg-tertiary)" }}
                      >
                        <ChevronDown
                          size={13}
                          className="transition-transform duration-200 group-open:rotate-180"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </div>
                    </summary>
                    <div
                      className="text-xs leading-relaxed border-t"
                      style={{ color: "var(--text-secondary)", borderColor: "var(--border-subtle)", marginTop: "10px", paddingTop: "10px" }}
                    >
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Bottom Collapse Button */}
            <div className="flex justify-center">
              <button
                onClick={handleToggle}
                className="flex items-center gap-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                }}
              >
                <ChevronUp size={14} style={{ color: "var(--accent-primary)" }} />
                <span>Close Documentation &amp; Back to Editor</span>
              </button>
            </div>

            {/* Footer Sitemap Links */}
            <footer
              className="flex flex-col sm:flex-row items-center justify-between text-[11px] gap-3 border-t"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border-color)", paddingTop: "16px" }}
            >
              <div>
                © {new Date().getFullYear()} JSON Studio. Fast, Private &amp; Modern Developer Toolset.
              </div>
              <nav aria-label="Footer Tool Links" className="flex flex-wrap items-center gap-2.5">
                <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">JSON Viewer</Link>
                <span>•</span>
                <Link href="/diff" className="hover:text-[var(--text-primary)] transition-colors">JSON Diff</Link>
                <span>•</span>
                <Link href="/schema-validator" className="hover:text-[var(--text-primary)] transition-colors">Schema Validator</Link>
                <span>•</span>
                <Link href="/jsonpath" className="hover:text-[var(--text-primary)] transition-colors">JSONPath</Link>
                <span>•</span>
                <Link href="/converter" className="hover:text-[var(--text-primary)] transition-colors">Converter</Link>
                <span>•</span>
                <Link href="/repair" className="hover:text-[var(--text-primary)] transition-colors">Auto-Repair</Link>
                <span>•</span>
                <Link href="/graph" className="hover:text-[var(--text-primary)] transition-colors">Graph</Link>
                <span>•</span>
                <Link href="/table" className="hover:text-[var(--text-primary)] transition-colors">Table</Link>
              </nav>
            </footer>
          </div>
        )}
      </div>
    </aside>
  );
}
