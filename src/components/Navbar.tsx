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
  SlidersHorizontal,
  Menu,
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
  onToggleMobileSidebar?: () => void;
}

// Dedicated divider between action items
const ToolbarDivider = () => (
  <div
    className="h-5 w-[1px] flex-shrink-0 self-center hidden sm:block"
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
  onToggleMobileSidebar,
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="w-full h-12 flex items-center justify-between gap-2">
        {/* App Title & Brand + Mobile Sidebar Button */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              aria-label="Open Navigation Sidebar"
              title="Open Tools Sidebar"
              className="md:hidden p-1.5 -ml-1 text-[var(--text-secondary)] hover:text-white rounded-md hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center cursor-pointer"
            >
              <Menu size={20} />
            </button>
          )}

          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            <Braces size={18} />
          </div>
          <span className="font-bold tracking-tight text-sm text-[var(--text-primary)] inline">
            JSON<span style={{ color: "var(--accent-primary)" }}>Studio</span>
          </span>
        </div>

        {/* Global Toolbar with dividers ONLY among action items */}
        <div className="flex items-center overflow-x-auto no-scrollbar py-1 gap-1 flex-1 justify-center sm:justify-start max-w-full sm:max-w-none">
          {/* 1. Paste JSON */}
          <button
            onClick={handleDirectPaste}
            aria-label="Paste JSON from Clipboard"
            title="Paste JSON from Clipboard"
            className="flex items-center gap-1.5 text-xs rounded-md hover:bg-[var(--bg-hover)] text-emerald-400 hover:text-emerald-300 transition-all font-medium flex-shrink-0 px-2.5 py-1.5"
          >
            <ClipboardPaste size={15} />
            <span className="hidden sm:inline">Paste</span>
          </button>

          <ToolbarDivider />

          {/* 2. Format */}
          <button
            onClick={onFormat}
            aria-label="Beautify and Format JSON"
            title="Beautify / Format (Shift+Alt+F)"
            className="flex items-center gap-1.5 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0 px-2.5 py-1.5"
          >
            <Sparkles size={15} className="text-emerald-400" />
            <span>Format</span>
          </button>

          <ToolbarDivider />

          {/* 3. Auto-Repair */}
          <button
            onClick={onRepair}
            aria-label="Auto-Repair Malformed JSON"
            title="Auto Fix / Repair Broken JSON"
            className="flex items-center gap-1.5 text-xs rounded-md hover:bg-[var(--bg-hover)] text-amber-400 hover:text-amber-300 transition-all font-medium flex-shrink-0 px-2.5 py-1.5"
          >
            <Wand2 size={15} />
            <span className="hidden xs:inline sm:inline">Repair</span>
          </button>

          <ToolbarDivider />

          {/* 4. Open File (Hidden on ultra-small screens, in mobile menu) */}
          <button
            onClick={onOpenFileUpload}
            aria-label="Open JSON File from Disk"
            title="Open JSON File from Disk"
            className="hidden md:flex items-center gap-1.5 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0 px-2.5 py-1.5"
          >
            <FolderOpen size={15} />
            <span>Open</span>
          </button>

          <ToolbarDivider />

          {/* 5. Fetch URL (Hidden on small screens) */}
          <button
            onClick={onOpenUrlImport}
            aria-label="Fetch JSON from API or URL"
            title="Fetch JSON from API / URL"
            className="hidden lg:flex items-center gap-1.5 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0 px-2.5 py-1.5"
          >
            <Globe size={15} />
            <span>Fetch URL</span>
          </button>

          <ToolbarDivider />

          {/* 6. Clear */}
          <button
            onClick={onClear}
            aria-label="Clear Document"
            title="Clear Document Content"
            className="hidden sm:flex items-center gap-1.5 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-all font-medium flex-shrink-0 px-2.5 py-1.5"
          >
            <Eraser size={15} />
            <span>Clear</span>
          </button>

          <ToolbarDivider />

          {/* 7. Split View Toggle (Desktop only) */}
          <button
            onClick={onToggleSplitView}
            aria-label={isSplitView ? "Switch to Single View" : "Toggle Split View"}
            title={isSplitView ? "Switch to Single View" : "Split View (Editor + Tree)"}
            className={`hidden md:flex items-center gap-1.5 text-xs rounded-md transition-all flex-shrink-0 font-medium px-2.5 py-1.5 ${
              isSplitView
                ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold border border-[var(--accent-primary)]/40 shadow-xs"
                : "hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
            }`}
          >
            <Columns size={15} className={isSplitView ? "text-[var(--accent-primary)]" : ""} />
            <span className="hidden lg:inline">Split</span>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            aria-label="Copy JSON Content"
            title="Copy Formatted JSON"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors relative"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>

          {/* Download File */}
          <button
            onClick={onDownload}
            aria-label="Download JSON file"
            title="Download JSON File"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors"
          >
            <Download size={16} />
          </button>

          {/* Theme Dropdown */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              aria-label="Change Color Theme"
              title="Change Theme"
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors"
            >
              <Palette size={16} />
            </button>

            {isThemeOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-2xl border py-2 z-50 animate-slide-down"
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

          {/* Mobile Actions Drawer Button (Visible on < md) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open Actions Menu"
            title="More Actions"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-primary)]"
          >
            <SlidersHorizontal size={16} />
          </button>

          {/* Command Palette Button (Desktop >= md) */}
          <button
            onClick={onOpenCommandPalette}
            aria-label="Open Command Palette"
            className="hidden md:flex items-center gap-2 px-2.5 py-1 text-xs rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Command Palette (Ctrl+K / Cmd+K)"
          >
            <Command size={14} />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)]">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Mobile Actions Modal / Bottom Sheet */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl border-t bg-[var(--bg-secondary)] border-[var(--border-color)] p-4 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="font-bold text-sm text-[var(--text-primary)]">Quick Actions</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-white bg-[var(--bg-tertiary)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenFileUpload();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium"
              >
                <FolderOpen size={16} className="text-blue-400" />
                <span>Upload File</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenUrlImport();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium"
              >
                <Globe size={16} className="text-cyan-400" />
                <span>Fetch from URL</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onClear();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium"
              >
                <Eraser size={16} className="text-red-400" />
                <span>Clear Editor</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenCommandPalette();
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium"
              >
                <Command size={16} className="text-amber-400" />
                <span>Search / Commands</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {isPasteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsPasteModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden animate-slide-down bg-[var(--bg-secondary)] border-[var(--border-color)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2.5">
                <ClipboardPaste size={18} className="text-emerald-400" />
                <span className="font-semibold text-sm text-[var(--text-primary)]">Paste JSON Content</span>
              </div>
              <button onClick={() => setIsPasteModalOpen(false)} className="text-[var(--text-muted)] hover:text-white p-1">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 font-mono text-xs">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your raw JSON text here..."
                rows={8}
                autoFocus
                className="w-full p-3 rounded-lg bg-[var(--bg-input)] text-white border border-[var(--border-color)] focus:border-[var(--accent-primary)] outline-none resize-none font-mono text-xs"
              />

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="pasteNewTab"
                  checked={pasteAsNewTab}
                  onChange={(e) => setPasteAsNewTab(e.target.checked)}
                  className="rounded w-4 h-4"
                />
                <label htmlFor="pasteNewTab" className="text-xs text-[var(--text-primary)] cursor-pointer select-none">
                  Open in a new document tab
                </label>
              </div>
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-end gap-2.5 bg-[var(--bg-primary)] border-[var(--border-color)]">
              <button
                onClick={() => setIsPasteModalOpen(false)}
                className="px-3.5 py-2 rounded-lg hover:bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPasteModal}
                disabled={!pastedText.trim()}
                className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
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
