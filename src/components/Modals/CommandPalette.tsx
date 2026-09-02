"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  FolderTree,
  Code2,
  TableProperties,
  GitCompare,
  ShieldCheck,
  ArrowLeftRight,
  Wrench,
  Sparkles,
  Minimize2,
  ArrowDownAZ,
  Download,
  Copy,
  Layers,
  Palette,
  FilePlus,
  Globe,
} from "lucide-react";
import { ActiveView, AppTheme } from "@/types";
import { SAMPLE_DATASETS } from "@/lib/sample-data";

interface CommandItem {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: ActiveView) => void;
  onThemeChange: (theme: AppTheme) => void;
  onFormat: () => void;
  onMinify: () => void;
  onSortKeys: () => void;
  onRepair: () => void;
  onNewTab: () => void;
  onOpenUrlImport: () => void;
  onCopyAll: () => void;
  onDownload: () => void;
  onLoadSample: (sampleId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onViewChange,
  onThemeChange,
  onFormat,
  onMinify,
  onSortKeys,
  onRepair,
  onNewTab,
  onOpenUrlImport,
  onCopyAll,
  onDownload,
  onLoadSample,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Views
    { id: "v-editor", title: "View: Switch to Monaco Code Editor", category: "Navigation", icon: Code2, shortcut: "Alt+1", action: () => { onViewChange("editor"); onClose(); } },
    { id: "v-tree", title: "View: Switch to Tree & JSON Explorer", category: "Navigation", icon: FolderTree, shortcut: "Alt+2", action: () => { onViewChange("tree"); onClose(); } },
    { id: "v-table", title: "View: Switch to Tabular Grid View", category: "Navigation", icon: TableProperties, shortcut: "Alt+3", action: () => { onViewChange("table"); onClose(); } },
    { id: "v-diff", title: "View: Switch to JSON Comparer & Diff", category: "Navigation", icon: GitCompare, shortcut: "Alt+4", action: () => { onViewChange("diff"); onClose(); } },
    { id: "v-schema", title: "View: Switch to Schema Validator", category: "Navigation", icon: ShieldCheck, shortcut: "Alt+5", action: () => { onViewChange("schema"); onClose(); } },
    { id: "v-converter", title: "View: Switch to Type & Format Converter", category: "Navigation", icon: ArrowLeftRight, shortcut: "Alt+6", action: () => { onViewChange("converter"); onClose(); } },
    { id: "v-repair", title: "View: Switch to Auto JSON Repair", category: "Navigation", icon: Wrench, shortcut: "Alt+7", action: () => { onViewChange("repair"); onClose(); } },

    // Actions
    { id: "act-format", title: "Format: Beautify JSON (2 spaces)", category: "Edit", icon: Sparkles, shortcut: "Shift+Alt+F", action: () => { onFormat(); onClose(); } },
    { id: "act-minify", title: "Format: Minify / Compact JSON", category: "Edit", icon: Minimize2, action: () => { onMinify(); onClose(); } },
    { id: "act-sort", title: "Format: Sort Keys Alphabetically", category: "Edit", icon: ArrowDownAZ, action: () => { onSortKeys(); onClose(); } },
    { id: "act-repair", title: "Repair: Auto Fix Malformed / Broken JSON", category: "Edit", icon: Wrench, action: () => { onRepair(); onClose(); } },
    { id: "act-new", title: "File: New Document Tab", category: "File", icon: FilePlus, shortcut: "Ctrl+N", action: () => { onNewTab(); onClose(); } },
    { id: "act-url", title: "File: Fetch JSON from URL", category: "File", icon: Globe, action: () => { onOpenUrlImport(); onClose(); } },
    { id: "act-copy", title: "File: Copy Formatted JSON to Clipboard", category: "File", icon: Copy, action: () => { onCopyAll(); onClose(); } },
    { id: "act-download", title: "File: Download JSON File", category: "File", icon: Download, action: () => { onDownload(); onClose(); } },

    // Themes
    { id: "th-dark", title: "Theme: VS Code Dark+", category: "Theme", icon: Palette, action: () => { onThemeChange("vscode-dark"); onClose(); } },
    { id: "th-tokyo", title: "Theme: Tokyo Night", category: "Theme", icon: Palette, action: () => { onThemeChange("tokyo-night"); onClose(); } },
    { id: "th-monokai", title: "Theme: Monokai Pro", category: "Theme", icon: Palette, action: () => { onThemeChange("monokai"); onClose(); } },
    { id: "th-light", title: "Theme: VS Code Light+", category: "Theme", icon: Palette, action: () => { onThemeChange("vscode-light"); onClose(); } },

    // Samples
    ...SAMPLE_DATASETS.map((s) => ({
      id: `s-${s.id}`,
      title: `Sample: Load ${s.name} (${s.category})`,
      category: "Sample",
      icon: Layers,
      action: () => { onLoadSample(s.id); onClose(); },
    })),
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Reset search & selection when the palette opens (adjusted during render to
  // avoid an extra cascading render from setting state inside an effect).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
    }
  }

  // Reset selection whenever the search query changes.
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setSelectedIndex(0);
  }

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-lg shadow-2xl border overflow-hidden animate-slide-down"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-b"
          style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)" }}
        >
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-white placeholder-[var(--text-muted)] focus:outline-none font-mono"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-color)]">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-1 font-mono text-xs">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-[var(--text-muted)]">No commands matching &quot;{search}&quot;</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-[var(--accent-primary)] text-white font-semibold"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className={isSelected ? "text-white" : "text-[var(--text-muted)]"} />
                    <span>{cmd.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold opacity-60 ${isSelected ? "text-white" : ""}`}>
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="text-[10px] px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
