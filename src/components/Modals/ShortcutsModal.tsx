"use client";

import React from "react";
import { Keyboard, X } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "View Modes",
      items: [
        { key: "Alt + 1", desc: "Switch to Monaco Code Editor" },
        { key: "Alt + 2", desc: "Switch to Tree & JSON Explorer" },
        { key: "Alt + 3", desc: "Switch to Tabular Grid View" },
        { key: "Alt + 4", desc: "Switch to JSON Comparer / Diff" },
        { key: "Alt + 5", desc: "Switch to Schema Validator" },
        { key: "Alt + 6", desc: "Switch to Type & Format Converter" },
        { key: "Alt + 7", desc: "Switch to Auto JSON Repair" },
      ],
    },
    {
      title: "Formatting & Actions",
      items: [
        { key: "Ctrl + K / Cmd + K", desc: "Open Command Palette" },
        { key: "Shift + Alt + F", desc: "Format / Beautify JSON" },
        { key: "Ctrl + N", desc: "New Document Tab" },
        { key: "Ctrl + W", desc: "Close Active Tab" },
        { key: "Ctrl + /", desc: "View Keyboard Shortcuts" },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg shadow-2xl border overflow-hidden animate-slide-down"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-amber-400" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto font-mono text-xs">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 font-sans">
                {group.title}
              </div>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-1 px-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]"
                  >
                    <span className="text-[var(--text-primary)]">{item.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[var(--bg-input)] text-white text-[11px] border border-[var(--border-color)]">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex justify-end bg-[var(--bg-primary)]" style={{ borderColor: "var(--border-color)" }}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-xs text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
