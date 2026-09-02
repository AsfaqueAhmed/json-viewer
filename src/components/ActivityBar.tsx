"use client";

import React, { useState } from "react";
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

  const primaryNavItems: {
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
    <aside
      className={`flex-shrink-0 flex flex-col justify-between py-2 border-r select-none z-20 transition-all duration-200 ease-in-out ${
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

        {/* Primary View Navigation Items */}
        {primaryNavItems.map((item) => {
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
  );
};
