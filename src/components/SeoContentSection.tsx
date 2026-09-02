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
} from "lucide-react";
import { TOOLS_CONFIG } from "@/lib/seo-schemas";

interface SeoContentSectionProps {
  currentToolKey?: string;
}

export function SeoContentSection({ currentToolKey = "editor" }: SeoContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toolsList = [
    {
      key: "editor",
      name: "JSON Viewer & Editor",
      path: "/",
      icon: FileCode2,
      color: "text-sky-400",
      description: "Monaco-powered JSON Viewer, syntax highlighter, tree inspector, and formatter.",
    },
    {
      key: "diff",
      name: "JSON Diff & Compare",
      path: "/diff",
      icon: GitCompare,
      color: "text-indigo-400",
      description: "Side-by-side semantic JSON difference comparison and visual merge tool.",
    },
    {
      key: "schema-validator",
      name: "JSON Schema Validator",
      path: "/schema-validator",
      icon: CheckCircle2,
      color: "text-violet-400",
      description: "AJV-powered Draft-07 schema validation and automatic schema template generator.",
    },
    {
      key: "jsonpath",
      name: "JSONPath Query Studio",
      path: "/jsonpath",
      icon: Search,
      color: "text-amber-400",
      description: "Real-time JSONPath tester and query evaluator with selector cheat-sheet.",
    },
    {
      key: "converter",
      name: "JSON Converter",
      path: "/converter",
      icon: ArrowRightLeft,
      color: "text-pink-400",
      description: "Convert JSON to TypeScript interfaces, clean YAML, CSV spreadsheets, and XML.",
    },
    {
      key: "repair",
      name: "JSON Auto-Repair",
      path: "/repair",
      icon: Wrench,
      color: "text-emerald-400",
      description: "Heuristic repair engine for malformed quotes, trailing commas, and missing braces.",
    },
    {
      key: "graph",
      name: "Node Graph Visualizer",
      path: "/graph",
      icon: Network,
      color: "text-teal-400",
      description: "Interactive visual node hierarchy graph showing object-array relationships.",
    },
    {
      key: "table",
      name: "JSON Table Viewer",
      path: "/table",
      icon: Table,
      color: "text-orange-400",
      description: "Tabular spreadsheet grid for viewing and sorting large JSON object arrays.",
    },
  ];

  // Aggregate FAQs from all tools for comprehensive search indexing
  const allFaqs = Object.values(TOOLS_CONFIG).flatMap((tool) => tool.faqs);

  return (
    <aside
      id="seo-guide-section"
      aria-label="JSON Studio Documentation and Developer Guide"
      className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header / SEO Toggle */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
              <Sparkles className="w-4 h-4" />
              <span>Modern Web Developer Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
              JSON Studio — Developer Tool Index &amp; Documentation
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Dedicated high-performance developer tools for JSON viewing, comparing, querying, validating, and converting.
            </p>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-[var(--bg-hover)] border border-[var(--border-color)] transition-colors cursor-pointer text-[var(--text-primary)]"
            aria-expanded={isExpanded}
            aria-label="Toggle developer documentation"
          >
            <span>{isExpanded ? "Hide Developer Guide" : "Explore Features & Developer Docs"}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Content Area */}
        <div className={`space-y-12 pt-6 ${isExpanded ? "block" : "hidden"}`}>
          {/* Internal Linking Sitemap Matrix */}
          <section aria-labelledby="tools-matrix-heading">
            <h3 id="tools-matrix-heading" className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Online JSON Developer Tools (Direct Index)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {toolsList.map((tool) => {
                const IconComponent = tool.icon;
                const isCurrent = tool.key === currentToolKey;
                return (
                  <Link
                    key={tool.key}
                    href={tool.path}
                    className={`p-4 rounded-lg border transition-all flex flex-col gap-2 group relative ${
                      isCurrent
                        ? "bg-[var(--bg-tertiary)] border-[var(--accent-primary)] shadow-sm"
                        : "bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 font-semibold text-sm ${tool.color}`}>
                        <IconComponent className="w-4 h-4" />
                        <h4>{tool.name}</h4>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {tool.description}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold mt-1">
                        ● Currently Active Tool
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Privacy & Performance Guarantee Section */}
          <section className="p-5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Enterprise-Grade Privacy &amp; 100% Client-Side Architecture
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Safe for proprietary API responses, banking payloads, database dumps, and production secrets. No external network transmission.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Zap className="w-3 h-3 mr-1" /> Ultra-Fast
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 mr-1" /> Safe &amp; Private
              </span>
            </div>
          </section>

          {/* FAQ Accordion with Static Semantic HTML Details/Summary for 100% Crawlability */}
          <section aria-labelledby="faq-heading">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-[var(--accent-primary)]" />
              <h3 id="faq-heading" className="text-lg font-semibold text-[var(--text-primary)]">
                Frequently Asked Questions (FAQ)
              </h3>
            </div>

            <div className="divide-y divide-[var(--border-color)] border border-[var(--border-color)] rounded-lg bg-[var(--bg-primary)] overflow-hidden">
              {allFaqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group transition-colors p-4 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex items-center justify-between gap-4 font-medium text-sm text-[var(--text-primary)] cursor-pointer list-none select-none">
                    <span>{faq.question}</span>
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 group-open:rotate-180 shrink-0" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Internal Footer Sitemap Links */}
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
      </div>
    </aside>
  );
}
