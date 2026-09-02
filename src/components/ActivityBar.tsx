"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Code2,
  FolderTree,
  TableProperties,
  GitCompare,
  ShieldCheck,
  ArrowLeftRight,
  Wrench,
  Keyboard,
  PanelLeftClose,
  PanelLeft,
  MoreHorizontal,
  Share2,
  Terminal,
  BookOpen,
  X,
} from "lucide-react";
import { ActiveView } from "@/types";

interface ActivityBarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  onOpenShortcuts: () => void;
  hasErrors?: boolean;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  onOpenShortcuts,
  hasErrors,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const mobileMoreRef = useRef<HTMLDivElement>(null);

  // Close mobile more sheet on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMoreRef.current &&
        !mobileMoreRef.current.contains(event.target as Node)
      ) {
        setIsMobileMoreOpen(false);
      }
    }
    if (isMobileMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMoreOpen]);

  const allNavItems: {
    id: ActiveView;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    shortcut: string;
    badge?: boolean;
    category: "primary" | "secondary";
  }[] = [
    { id: "editor", label: "Monaco Code Editor", shortLabel: "Editor", icon: Code2, shortcut: "Alt+1", category: "primary" },
    { id: "tree", label: "Tree Explorer", shortLabel: "Tree", icon: FolderTree, shortcut: "Alt+2", category: "primary" },
    { id: "diff", label: "JSON Diff Comparer", shortLabel: "Diff", icon: GitCompare, shortcut: "Alt+4", category: "primary" },
    { id: "converter", label: "Type Converter", shortLabel: "Convert", icon: ArrowLeftRight, shortcut: "Alt+6", category: "primary" },
    { id: "schema", label: "Schema Validator", shortLabel: "Schema", icon: ShieldCheck, shortcut: "Alt+5", category: "secondary" },
    { id: "repair", label: "Auto JSON Repair", shortLabel: "Repair", icon: Wrench, shortcut: "Alt+7", badge: hasErrors, category: "secondary" },
    { id: "table", label: "Tabular Grid", shortLabel: "Table", icon: TableProperties, shortcut: "Alt+3", category: "secondary" },
    { id: "graph", label: "Node Graph", shortLabel: "Graph", icon: Share2, shortcut: "Alt+8", category: "secondary" },
    { id: "query", label: "JSONPath Studio", shortLabel: "Query", icon: Terminal, shortcut: "Alt+9", category: "secondary" },
  ];

  const primaryMobileItems = allNavItems.filter((i) => i.category === "primary");
  const secondaryMobileItems = allNavItems.filter((i) => i.category === "secondary");

  const isCurrentViewSecondary = secondaryMobileItems.some((i) => i.id === activeView);

  return (
    <>
      {/* 1. DESKTOP Activity Bar (>= md screens) */}
      <aside
        className={`hidden md:flex flex-shrink-0 flex-col justify-between py-2 border-r select-none z-20 transition-all duration-200 ease-in-out ${
          isExpanded ? "w-52" : "w-14"
        }`}
        style={{
          backgroundColor: "var(--bg-activity)",
          borderColor: "var(--border-color)",
          paddingLeft: "8px",
          paddingRight: "8px",
        }}
        aria-label="Activity Bar"
      >
        {/* Top Navigation Group */}
        <div className="flex flex-col gap-1.5 w-full items-center">
          {/* Expand / Collapse Toggle Button at the top */}
          <div
            className="w-full flex items-center justify-center pb-1.5 mb-0.5 border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              className={`w-full h-10 flex items-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all ${
                isExpanded ? "justify-between text-xs font-semibold text-[var(--text-muted)]" : "justify-center"
              }`}
              style={{
                paddingLeft: isExpanded ? "12px" : undefined,
                paddingRight: isExpanded ? "10px" : undefined,
              }}
            >
              {isExpanded ? (
                <>
                  <span className="uppercase text-[11px] tracking-wider font-semibold text-[var(--text-muted)]">
                    Navigation
                  </span>
                  <PanelLeftClose size={18} />
                </>
              ) : (
                <PanelLeft size={19} />
              )}
            </button>
          </div>

          {/* All Tool Navigation Items */}
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                aria-label={`${item.label} (${item.shortcut})`}
                title={`${item.label} (${item.shortcut})`}
                className={`relative w-full h-10 flex items-center rounded-md transition-all duration-150 group ${
                  isExpanded ? "justify-start gap-2.5 text-xs" : "justify-center"
                } ${
                  isActive
                    ? "text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium"
                }`}
                style={{
                  backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                  paddingLeft: isExpanded ? "12px" : undefined,
                  paddingRight: isExpanded ? "10px" : undefined,
                }}
              >
                {/* Active left indicator line like VS Code */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                  />
                )}

                <Icon size={18} className="flex-shrink-0 transition-transform group-hover:scale-105" />
                {isExpanded && <span className="truncate text-xs">{item.label}</span>}

                {/* Error badge */}
                {item.badge && (
                  <span
                    className={
                      isExpanded
                        ? "ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0"
                        : "absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                    }
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Action Icons */}
        <div
          className="flex flex-col gap-1 w-full items-center pt-2 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={onOpenShortcuts}
            aria-label="Open Keyboard Shortcuts"
            title="Keyboard Shortcuts (Ctrl+/)"
            className={`w-full h-10 flex items-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all ${
              isExpanded ? "justify-start gap-2.5 text-xs font-medium" : "justify-center"
            }`}
            style={{
              paddingLeft: isExpanded ? "12px" : undefined,
              paddingRight: isExpanded ? "10px" : undefined,
            }}
          >
            <Keyboard size={18} className="flex-shrink-0" />
            {isExpanded && <span className="truncate text-xs">Shortcuts</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION BAR (< md screens) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 border-t select-none flex items-center justify-around px-1 bg-[var(--bg-activity)]/95 backdrop-blur-md"
        style={{ borderColor: "var(--border-color)" }}
        aria-label="Mobile Navigation"
      >
        {/* Primary 4 Mobile Icons */}
        {primaryMobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsMobileMoreOpen(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-md transition-colors relative ${
                isActive
                  ? "text-[var(--accent-primary)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              }`}
            >
              {isActive && (
                <div
                  className="absolute top-0 w-8 h-[2.5px] rounded-full"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                />
              )}
              <Icon size={19} className="mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.shortLabel}</span>
            </button>
          );
        })}

        {/* 5th Mobile Icon: "More Tools..." */}
        <button
          onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-md transition-colors relative ${
            isMobileMoreOpen || isCurrentViewSecondary
              ? "text-[var(--accent-primary)] font-semibold"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
          }`}
        >
          {(isMobileMoreOpen || isCurrentViewSecondary) && (
            <div
              className="absolute top-0 w-8 h-[2.5px] rounded-full"
              style={{ backgroundColor: "var(--accent-primary)" }}
            />
          )}
          <MoreHorizontal size={19} className="mb-0.5" />
          <span className="text-[10px] tracking-tight">More</span>
          {hasErrors && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </nav>

      {/* 3. MOBILE "MORE TOOLS" ACTION SHEET / DRAWER */}
      {isMobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            ref={mobileMoreRef}
            className="w-full rounded-t-2xl border-t bg-[var(--bg-secondary)] border-[var(--border-color)] p-4 shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--text-primary)]">All Studio Tools</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold">
                  8 Tools
                </span>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-white bg-[var(--bg-tertiary)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid of Secondary Tools */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {secondaryMobileItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMoreOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--text-primary)] font-semibold shadow-xs"
                        : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? "bg-[var(--accent-primary)] text-white"
                          : "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                      }`}
                    >
                      <Icon size={17} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {item.shortLabel}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] truncate">
                        {item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Row in Drawer */}
            <div className="pt-2 border-t border-[var(--border-color)] flex items-center gap-2">
              <button
                onClick={() => {
                  setIsMobileMoreOpen(false);
                  onOpenShortcuts();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-white font-medium"
              >
                <Keyboard size={15} />
                <span>Shortcuts</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMoreOpen(false);
                  const el = document.getElementById("seo-guide-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-white font-medium"
              >
                <BookOpen size={15} />
                <span>Docs &amp; Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
