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
      color: "text-sky-400",
      borderHover: "hover:border-sky-500/50",
      bgLight: "bg-sky-500/10",
      gradient: "from-sky-500/10 via-transparent to-transparent",
      description: "Monaco-powered JSON viewer, syntax highlighter, tree inspector, and formatter.",
    },
    {
      key: "diff",
      name: "JSON Diff & Compare",
      badge: "Semantic Diff",
      path: "/diff",
      icon: GitCompare,
      color: "text-indigo-400",
      borderHover: "hover:border-indigo-500/50",
      bgLight: "bg-indigo-500/10",
      gradient: "from-indigo-500/10 via-transparent to-transparent",
      description: "Side-by-side semantic JSON difference comparison and visual merge tool.",
    },
    {
      key: "schema-validator",
      name: "JSON Schema Validator",
      badge: "AJV Draft-07",
      path: "/schema-validator",
      icon: CheckCircle2,
      color: "text-violet-400",
      borderHover: "hover:border-violet-500/50",
      bgLight: "bg-violet-500/10",
      gradient: "from-violet-500/10 via-transparent to-transparent",
      description: "AJV-powered Draft-07 schema validation and automatic schema template generator.",
    },
    {
      key: "jsonpath",
      name: "JSONPath Query Studio",
      badge: "Live Querying",
      path: "/jsonpath",
      icon: Search,
      color: "text-amber-400",
      borderHover: "hover:border-amber-500/50",
      bgLight: "bg-amber-500/10",
      gradient: "from-amber-500/10 via-transparent to-transparent",
      description: "Real-time JSONPath tester and query evaluator with selector cheat-sheet.",
    },
    {
      key: "converter",
      name: "JSON Converter",
      badge: "Type Generator",
      path: "/converter",
      icon: ArrowRightLeft,
      color: "text-pink-400",
      borderHover: "hover:border-pink-500/50",
      bgLight: "bg-pink-500/10",
      gradient: "from-pink-500/10 via-transparent to-transparent",
      description: "Convert JSON to TypeScript interfaces, clean YAML, CSV spreadsheets, and XML.",
    },
    {
      key: "repair",
      name: "JSON Auto-Repair",
      badge: "Syntax Heuristics",
      path: "/repair",
      icon: Wrench,
      color: "text-emerald-400",
      borderHover: "hover:border-emerald-500/50",
      bgLight: "bg-emerald-500/10",
      gradient: "from-emerald-500/10 via-transparent to-transparent",
      description: "Heuristic repair engine for malformed quotes, trailing commas, and missing braces.",
    },
    {
      key: "graph",
      name: "Node Graph Visualizer",
      badge: "Force-Directed",
      path: "/graph",
      icon: Network,
      color: "text-teal-400",
      borderHover: "hover:border-teal-500/50",
      bgLight: "bg-teal-500/10",
      gradient: "from-teal-500/10 via-transparent to-transparent",
      description: "Interactive visual node hierarchy graph showing object-array relationships.",
    },
    {
      key: "table",
      name: "JSON Table Viewer",
      badge: "Grid View & CSV",
      path: "/table",
      icon: Table,
      color: "text-orange-400",
      borderHover: "hover:border-orange-500/50",
      bgLight: "bg-orange-500/10",
      gradient: "from-orange-500/10 via-transparent to-transparent",
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
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        {/* Header / Expand & Collapse Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-8 border-b border-[var(--border-color)]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/25 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-primary)] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modern Developer Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Developer Tool Index &amp; Documentation
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              Fast, privacy-focused developer suite for inspecting, formatting, comparing, validating, and converting JSON payloads client-side.
            </p>
          </div>

          <button
            onClick={handleToggle}
            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50 transition-all cursor-pointer text-[var(--text-primary)] shadow-sm hover:shadow-md flex-shrink-0"
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
          <div className="space-y-12 pt-10 animate-fade-in">
            {/* Section 1: Developer Tools Grid Matrix */}
            <section aria-labelledby="tools-matrix-heading">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 id="tools-matrix-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Developer Tools Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                  8 Tools Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {toolsList.map((tool) => {
                  const IconComponent = tool.icon;
                  const isCurrent = tool.key === currentToolKey;

                  return (
                    <Link
                      key={tool.key}
                      href={tool.path}
                      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 group relative overflow-hidden bg-gradient-to-b ${
                        isCurrent
                          ? "bg-[var(--bg-tertiary)] border-[var(--accent-primary)] shadow-md ring-1 ring-[var(--accent-primary)]/40 from-[var(--accent-primary)]/10"
                          : `bg-[var(--bg-primary)] border-[var(--border-color)] ${tool.borderHover} hover:shadow-lg hover:-translate-y-1 hover:from-[var(--bg-hover)]`
                      }`}
                    >
                      {/* Top Row: Icon + Badge + Arrow */}
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className={`p-2.5 rounded-xl ${tool.bgLight} ${tool.color} ring-1 ring-white/5 shadow-inner`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                              {tool.badge}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1.5 group-hover:text-white transition-colors">
                          {tool.name}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      </div>

                      {/* Card Footer Status */}
                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono">
                        {isCurrent ? (
                          <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                            <span>Currently Active</span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                            Launch Tool →
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Privacy Guarantee Banner Card */}
            <section className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-950/25 via-[var(--bg-primary)] to-[var(--bg-primary)] border border-emerald-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm">
              <div className="flex items-start sm:items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ring-4 ring-emerald-500/5 flex-shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-[var(--text-primary)]">
                      100% Client-Side Privacy Architecture
                    </h4>
                    <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Zero Telemetry
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
                    Your JSON never leaves your browser sandbox. Perfectly safe for proprietary API secrets, tokens, production databases, and customer records.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-xs">
                  <Zap className="w-3.5 h-3.5 mr-1.5" /> WebAssembly Speed
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
                  <Lock className="w-3.5 h-3.5 mr-1.5" /> Zero Server Uploads
                </span>
              </div>
            </section>

            {/* Section 3: Frequently Asked Questions (FAQ) */}
            <section aria-labelledby="faq-heading">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                  <h3 id="faq-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Frequently Asked Questions ({allFaqs.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">Click to expand details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-text">
                {allFaqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-tertiary)]/30 transition-all duration-150 p-4 sm:p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                  >
                    <summary className="flex items-start justify-between gap-3 font-semibold text-xs sm:text-sm text-[var(--text-primary)] list-none select-none">
                      <span className="group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                        {faq.question}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent-primary)]/20 group-hover:text-[var(--accent-primary)] transition-all">
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>
                    <div className="mt-3.5 pt-3.5 border-t border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Bottom Collapse Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleToggle}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <ChevronUp className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Close Documentation &amp; Back to Editor</span>
              </button>
            </div>

            {/* Footer Sitemap Links */}
            <footer className="pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-secondary)] gap-4">
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
