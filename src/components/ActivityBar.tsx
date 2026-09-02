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
  BookOpen,
  X,
  Braces,
} from "lucide-react";
import { ActiveView } from "@/types";

interface ActivityBarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  onOpenShortcuts: () => void;
  hasErrors?: boolean;
  isMobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
  isDocsOpen?: boolean;
  onToggleDocs?: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  onOpenShortcuts,
  hasErrors,
  isMobileSidebarOpen = false,
  onCloseMobileSidebar,
  isDocsOpen,
  onToggleDocs,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);

  // Close mobile sidebar drawer on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileSidebarRef.current &&
        !mobileSidebarRef.current.contains(event.target as Node)
      ) {
        onCloseMobileSidebar?.();
      }
    }
    if (isMobileSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileSidebarOpen, onCloseMobileSidebar]);

  const allNavItems: {
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    shortcut: string;
    badge?: boolean;
  }[] = [
    { id: "editor", label: "Monaco Code Editor", icon: Code2, shortcut: "Alt+1" },
    { id: "tree", label: "Tree & JSON Explorer", icon: FolderTree, shortcut: "Alt+2" },
    { id: "table", label: "Tabular Grid View", icon: TableProperties, shortcut: "Alt+3" },
    { id: "diff", label: "JSON Comparer & Diff", icon: GitCompare, shortcut: "Alt+4" },
    { id: "schema", label: "Schema Validator", icon: ShieldCheck, shortcut: "Alt+5" },
    { id: "converter", label: "Type & Format Converter", icon: ArrowLeftRight, shortcut: "Alt+6" },
    { id: "repair", label: "Auto JSON Repair", icon: Wrench, shortcut: "Alt+7", badge: hasErrors },
  ];

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
        <div className="flex flex-col gap-1 w-full items-center">
          {/* Expand / Collapse Toggle Button at the top */}
          <div
            className="w-full flex items-center justify-center pb-1.5 mb-0.5 border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              className={`w-full h-10 flex items-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer ${
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
                className={`relative w-full h-10 flex items-center rounded-md transition-all duration-150 group cursor-pointer ${
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
            className={`w-full h-10 flex items-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer ${
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

      {/* 2. MOBILE SLIDE-OUT LEFT SIDEBAR DRAWER (< md screens, opened via Navbar hamburger) */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            ref={mobileSidebarRef}
            className="w-72 max-w-[85vw] h-full flex flex-col justify-between border-r shadow-2xl animate-slide-right overflow-y-auto select-none"
            style={{
              backgroundColor: "var(--bg-activity)",
              borderColor: "var(--border-color)",
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "12px",
              paddingBottom: "12px",
            }}
          >
            {/* Top Group */}
            <div className="flex flex-col w-full" style={{ gap: "6px" }}>
              {/* Drawer Top Header */}
              <div
                className="w-full flex items-center justify-between border-b"
                style={{
                  borderColor: "var(--border-subtle)",
                  paddingBottom: "12px",
                  marginBottom: "4px",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-white shadow-sm"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                  >
                    <Braces size={16} />
                  </div>
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    JSON<span style={{ color: "var(--accent-primary)" }}>Studio</span>
                  </span>
                </div>
                <button
                  onClick={onCloseMobileSidebar}
                  aria-label="Close Sidebar"
                  className="rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  style={{ padding: "6px" }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Section Header Card */}
              <div
                className="w-full flex items-center justify-between rounded-xl border"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-color)",
                  paddingLeft: "16px",
                  paddingRight: "12px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  marginBottom: "4px",
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Navigation
                </span>
                <button
                  onClick={onCloseMobileSidebar}
                  aria-label="Collapse Sidebar"
                  className="rounded-md border flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-color)", width: "26px", height: "26px" }}
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>

              {/* Tool Navigation Links matching desktop exactly */}
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      onCloseMobileSidebar?.();
                    }}
                    aria-label={item.label}
                    className={`relative w-full flex items-center rounded-xl transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "text-[var(--text-primary)] font-semibold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium"
                    }`}
                    style={{
                      backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                      paddingLeft: "16px",
                      paddingRight: "12px",
                      paddingTop: "13px",
                      paddingBottom: "13px",
                      gap: "14px",
                    }}
                  >
                    {/* Active left indicator line */}
                    {isActive && (
                      <div
                        className="absolute rounded-r"
                        style={{
                          left: 0,
                          top: "10px",
                          bottom: "10px",
                          width: "3px",
                          backgroundColor: "var(--accent-primary)",
                        }}
                      />
                    )}

                    <Icon size={19} className="flex-shrink-0" />
                    <span className="truncate text-sm">{item.label}</span>

                    {/* Error badge */}
                    {item.badge && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions (Shortcuts) */}
            <div
              className="flex flex-col w-full border-t mt-auto"
              style={{ borderColor: "var(--border-subtle)", gap: "4px", paddingTop: "12px" }}
            >
              <button
                onClick={() => {
                  onCloseMobileSidebar?.();
                  onOpenShortcuts();
                }}
                className="w-full flex items-center rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                style={{ paddingLeft: "16px", paddingRight: "12px", paddingTop: "13px", paddingBottom: "13px", gap: "14px" }}
              >
                <Keyboard size={19} className="flex-shrink-0" />
                <span className="truncate">Keyboard Shortcuts</span>
              </button>

              <button
                onClick={() => {
                  onCloseMobileSidebar?.();
                  if (onToggleDocs) {
                    onToggleDocs();
                  } else {
                    const el = document.getElementById("seo-guide-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full flex items-center rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
                style={{ paddingLeft: "16px", paddingRight: "12px", paddingTop: "13px", paddingBottom: "13px", gap: "14px" }}
              >
                <BookOpen size={19} className="flex-shrink-0" />
                <span className="truncate">{isDocsOpen ? "Close Documentation" : "Documentation & FAQ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
