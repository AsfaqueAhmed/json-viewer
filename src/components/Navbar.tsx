"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Braces,
  X,
  FolderOpen,
  Globe,
  Download,
  Copy,
  Sparkles,
  Palette,
  Command,
  Check,
  Wand2,
  Columns,
  ClipboardPaste,
  Eraser,
} from "lucide-react";
import { AppTheme } from "@/types";

interface NavbarProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onOpenFileUpload: () => void;
  onOpenUrlImport: () => void;
  onOpenCommandPalette: () => void;
  onPasteJson: (text: string, asNewTab?: boolean) => void;
  onFormat: () => void;
  onRepair: () => void;
  onClear: () => void;
  onCopyAll: () => void;
  onDownload: () => void;
  isSplitView: boolean;
  onToggleSplitView: () => void;
}

// Dedicated divider between action items
const ToolbarDivider = () => (
  <div
    className="h-5 w-[1px] flex-shrink-0 self-center"
    style={{
      backgroundColor: "var(--border-color)",
      opacity: 0.85,
    }}
  />
);

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onThemeChange,
  onOpenFileUpload,
  onOpenUrlImport,
  onOpenCommandPalette,
  onPasteJson,
  onFormat,
  onRepair,
  onClear,
  onCopyAll,
  onDownload,
  isSplitView,
  onToggleSplitView,
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [pasteAsNewTab, setPasteAsNewTab] = useState(true);
  const [copied, setCopied] = useState(false);

  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    onCopyAll();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        onPasteJson(text, true);
      } else {
        setIsPasteModalOpen(true);
      }
    } catch {
      setIsPasteModalOpen(true);
    }
  };

  const handleApplyPasteModal = () => {
    if (pastedText.trim()) {
      onPasteJson(pastedText, pasteAsNewTab);
      setPastedText("");
      setIsPasteModalOpen(false);
    }
  };

  const themeOptions: { id: AppTheme; label: string; previewColor: string }[] = [
    { id: "vscode-dark", label: "VS Code Dark+", previewColor: "#007acc" },
    { id: "tokyo-night", label: "Tokyo Night", previewColor: "#7aa2f7" },
    { id: "monokai", label: "Monokai Pro", previewColor: "#a6e22e" },
    { id: "vscode-light", label: "VS Code Light+", previewColor: "#005fb8" },
  ];

  return (
    <header
      className="w-full border-b select-none flex-shrink-0 z-30"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
        paddingLeft: "12px",
        paddingRight: "12px",
      }}
    >
      {/* Top Header Bar Container */}
      <div className="w-full h-12 flex items-center justify-between gap-4">
        {/* App Title & Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8.5 h-8.5 rounded-lg flex items-center justify-center font-mono font-bold text-white shadow-sm"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            <Braces size={19} />
          </div>
          <span className="font-bold tracking-tight text-sm text-[var(--text-primary)] inline">
            JSON<span style={{ color: "var(--accent-primary)" }}>Studio</span>
          </span>
        </div>

        {/* Global Toolbar with dividers ONLY among action items, with 12px left and right margins */}
        <div className="flex items-center overflow-x-auto no-scrollbar py-1">
          {/* 1. Paste JSON */}
          <button
            onClick={handleDirectPaste}
            aria-label="Paste JSON from Clipboard"
            title="Paste JSON from Clipboard"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-emerald-400 hover:text-emerald-300 transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <ClipboardPaste size={15} />
            <span>Paste JSON</span>
          </button>

          <ToolbarDivider />

          {/* 2. Open File */}
          <button
            onClick={onOpenFileUpload}
            aria-label="Open JSON File from Disk"
            title="Open JSON File from Disk"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <FolderOpen size={15} />
            <span className="hidden md:inline">Open</span>
          </button>

          <ToolbarDivider />

          {/* 3. Fetch URL */}
          <button
            onClick={onOpenUrlImport}
            aria-label="Fetch JSON from API or URL"
            title="Fetch JSON from API / URL"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Globe size={15} />
            <span className="hidden md:inline">Fetch URL</span>
          </button>

          <ToolbarDivider />

          {/* 4. Format */}
          <button
            onClick={onFormat}
            aria-label="Beautify and Format JSON"
            title="Beautify / Format (Shift+Alt+F)"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Sparkles size={15} className="text-emerald-400" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <ToolbarDivider />

          {/* 5. Auto-Repair */}
          <button
            onClick={onRepair}
            aria-label="Auto-Repair Malformed JSON"
            title="Auto Fix / Repair Broken JSON"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-amber-400 hover:text-amber-300 transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Wand2 size={15} />
            <span className="hidden sm:inline">Auto-Repair</span>
          </button>

          <ToolbarDivider />

          {/* 6. Clear */}
          <button
            onClick={onClear}
            aria-label="Clear Document"
            title="Clear Document Content"
            className="flex items-center gap-2 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all font-medium flex-shrink-0"
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Eraser size={15} />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <ToolbarDivider />

          {/* 7. Split View Toggle */}
          <button
            onClick={onToggleSplitView}
            aria-label={isSplitView ? "Switch to Single View" : "Toggle Split View"}
            title={isSplitView ? "Switch to Single View" : "Split View (Editor + Tree)"}
            className={`flex items-center gap-2 text-xs rounded-md transition-all flex-shrink-0 font-medium ${
              isSplitView
                ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/40 shadow-xs"
                : "hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)]"
            }`}
            style={{
              paddingLeft: "12px",
              paddingRight: "12px",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          >
            <Columns size={15} className={isSplitView ? "text-[var(--accent-primary)]" : ""} />
            <span className="hidden lg:inline">Split</span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          {/* Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            aria-label="Open Command Palette"
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Command Palette (Ctrl+K / Cmd+K)"
          >
            <Command size={14} />
            <span className="hidden xl:inline">Search...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
              ⌘K
            </kbd>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            aria-label="Copy JSON Content"
            title="Copy Formatted JSON"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors relative"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          {/* Download File */}
          <button
            onClick={onDownload}
            aria-label="Download JSON file"
            title="Download JSON File"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Download size={16} />
          </button>

          {/* Theme Dropdown */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              aria-label="Change Color Theme"
              title="Change Theme"
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Palette size={16} />
            </button>

            {isThemeOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-lg shadow-2xl border py-2 z-50 animate-slide-down"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Color Theme
                </div>
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onThemeChange(opt.id);
                      setIsThemeOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-[var(--bg-hover)] flex items-center justify-between text-[var(--text-primary)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-xs"
                        style={{ backgroundColor: opt.previewColor }}
                      />
                      <span className="font-medium">{opt.label}</span>
                    </div>
                    {theme === opt.id && <Check size={14} className="text-[var(--accent-primary)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paste Modal */}
      {isPasteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsPasteModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg shadow-2xl border overflow-hidden animate-slide-down bg-[var(--bg-secondary)] border-[var(--border-color)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <ClipboardPaste size={18} className="text-emerald-400" />
                <span className="font-semibold text-sm text-[var(--text-primary)]">Paste JSON Content</span>
              </div>
              <button onClick={() => setIsPasteModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 font-mono text-xs">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your raw JSON text here..."
                rows={10}
                autoFocus
                className="w-full p-3 rounded bg-[var(--bg-input)] text-white border border-[var(--border-color)] focus:border-[var(--accent-primary)] outline-none resize-none font-mono text-xs"
              />

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="pasteNewTab"
                  checked={pasteAsNewTab}
                  onChange={(e) => setPasteAsNewTab(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="pasteNewTab" className="text-xs text-[var(--text-primary)] cursor-pointer select-none">
                  Open in a new tab
                </label>
              </div>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-3 bg-[var(--bg-primary)] border-[var(--border-color)]">
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded hover:bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPasteModal}
                disabled={!pastedText.trim()}
                className="px-4 py-2 rounded bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                Apply JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
