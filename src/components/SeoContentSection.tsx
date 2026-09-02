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
      path: "/",
      icon: FileCode2,
      color: "text-sky-400",
      bgLight: "bg-sky-500/10",
      description: "Monaco-powered JSON viewer, syntax highlighter, tree inspector, and formatter.",
    },
    {
      key: "diff",
      name: "JSON Diff & Compare",
      path: "/diff",
      icon: GitCompare,
      color: "text-indigo-400",
      bgLight: "bg-indigo-500/10",
      description: "Side-by-side semantic JSON difference comparison and visual merge tool.",
    },
    {
      key: "schema-validator",
      name: "JSON Schema Validator",
      path: "/schema-validator",
      icon: CheckCircle2,
      color: "text-violet-400",
      bgLight: "bg-violet-500/10",
      description: "AJV-powered Draft-07 schema validation and automatic schema template generator.",
    },
    {
      key: "jsonpath",
      name: "JSONPath Query Studio",
      path: "/jsonpath",
      icon: Search,
      color: "text-amber-400",
      bgLight: "bg-amber-500/10",
      description: "Real-time JSONPath tester and query evaluator with selector cheat-sheet.",
    },
    {
      key: "converter",
      name: "JSON Converter",
      path: "/converter",
      icon: ArrowRightLeft,
      color: "text-pink-400",
      bgLight: "bg-pink-500/10",
      description: "Convert JSON to TypeScript interfaces, clean YAML, CSV spreadsheets, and XML.",
    },
    {
      key: "repair",
      name: "JSON Auto-Repair",
      path: "/repair",
      icon: Wrench,
      color: "text-emerald-400",
      bgLight: "bg-emerald-500/10",
      description: "Heuristic repair engine for malformed quotes, trailing commas, and missing braces.",
    },
    {
      key: "graph",
      name: "Node Graph Visualizer",
      path: "/graph",
      icon: Network,
      color: "text-teal-400",
      bgLight: "bg-teal-500/10",
      description: "Interactive visual node hierarchy graph showing object-array relationships.",
    },
    {
      key: "table",
      name: "JSON Table Viewer",
      path: "/table",
      icon: Table,
      color: "text-orange-400",
      bgLight: "bg-orange-500/10",
      description: "Tabular spreadsheet grid for viewing and sorting large JSON object arrays.",
    },
  ];

  // Aggregate FAQs from all tools for comprehensive search indexing
  const allFaqs = Object.values(TOOLS_CONFIG).flatMap((tool) => tool.faqs);

  return (
    <aside
      id="seo-guide-section"
      aria-label="JSON Studio Documentation and Developer Guide"
      className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all duration-300 select-none"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {/* Header / Expand & Collapse Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Modern Web Developer Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              JSON Studio — Tool Index &amp; Documentation
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Fast, privacy-focused developer suite for inspecting, formatting, comparing, validating, and converting JSON payloads client-side.
            </p>
          </div>

          <button
            onClick={handleToggle}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] transition-all cursor-pointer text-[var(--text-primary)] shadow-xs flex-shrink-0"
            aria-expanded={isExpanded}
            aria-label="Toggle developer documentation"
          >
            <span>{isExpanded ? "Close Documentation" : "Open Documentation & FAQ"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 text-[var(--text-muted)] ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Expandable Content Area */}
        {isExpanded && (
          <div className="space-y-10 pt-8 animate-fade-in">
            {/* Section 1: Developer Tools Grid Matrix */}
            <section aria-labelledby="tools-matrix-heading">
              <div className="flex items-center justify-between mb-4">
                <h3 id="tools-matrix-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Developer Tools Matrix
                </h3>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">8 Specialized Tools</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {toolsList.map((tool) => {
                  const IconComponent = tool.icon;
                  const isCurrent = tool.key === currentToolKey;

                  return (
                    <Link
                      key={tool.key}
                      href={tool.path}
                      className={`p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-3 group relative ${
                        isCurrent
                          ? "bg-[var(--bg-tertiary)] border-[var(--accent-primary)] shadow-sm ring-1 ring-[var(--accent-primary)]/20"
                          : "bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--bg-hover)]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-lg ${tool.bgLight} ${tool.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <h4 className="font-semibold text-xs text-[var(--text-primary)] mb-1">
                          {tool.name}
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>

                      {isCurrent ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent-primary)] font-bold pt-1 border-t border-[var(--border-subtle)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                          <span>Currently Active</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[var(--text-muted)] font-mono group-hover:text-[var(--text-secondary)] transition-colors pt-1 border-t border-[var(--border-subtle)]">
                          Launch Tool →
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Privacy Guarantee Banner */}
            <section className="p-5 sm:p-6 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    100% Client-Side Privacy Guarantee
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    Your JSON never leaves your browser. Safe for production databases, secret configs, tokens, and customer records.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Zap className="w-3.5 h-3.5 mr-1" /> WebAssembly Engine
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Zero Server Uploads
                </span>
              </div>
            </section>

            {/* Section 3: Frequently Asked Questions (FAQ) */}
            <section aria-labelledby="faq-heading">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 id="faq-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Frequently Asked Questions ({allFaqs.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">Click any question to expand</span>
              </div>

              <div className="space-y-2.5 select-text">
                {allFaqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent-primary)]/40 transition-all p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                  >
                    <summary className="flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[var(--text-primary)] list-none select-none">
                      <span className="group-hover:text-[var(--accent-primary)] transition-colors">
                        {faq.question}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent-primary)]/15 group-hover:text-[var(--accent-primary)] transition-all">
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Bottom Collapse Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleToggle}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
              >
                <ChevronUp className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Close Documentation &amp; Back to Editor</span>
              </button>
            </div>

            {/* Footer Sitemap Links */}
            <footer className="pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-secondary)] gap-4">
              <div>
                © {new Date().getFullYear()} JSON Studio. Fast, Private &amp; Modern Developer Toolset.
              </div>
              <nav aria-label="Footer Tool Links" className="flex flex-wrap items-center gap-3">
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
