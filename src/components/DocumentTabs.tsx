"use client";

import React, { useState } from "react";
import { FileCode, Plus, X } from "lucide-react";
import { DocumentTab } from "@/types";

interface DocumentTabsProps {
  tabs: DocumentTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
  onRenameTab: (id: string, newTitle: string) => void;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  onRenameTab,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleStartRename = (tab: DocumentTab) => {
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
  };

  const handleFinishRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameTab(id, editingTitle.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div
      className="h-10 flex items-center overflow-x-auto no-scrollbar gap-0 border-b select-none flex-shrink-0 z-20"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
        paddingLeft: "12px",
        paddingRight: "12px",
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;
        const isEditing = editingTabId === tab.id;

        return (
          <React.Fragment key={tab.id}>
            <div
              onClick={() => onSelectTab(tab.id)}
              onDoubleClick={() => handleStartRename(tab)}
              className={`group relative flex items-center h-full text-xs font-mono transition-colors cursor-pointer select-none flex-shrink-0 ${
                isActive
                  ? "text-[var(--text-primary)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              style={{
                backgroundColor: isActive ? "var(--bg-tab-inactive)" : "var(--bg-primary)",
                paddingLeft: "16px",
                paddingRight: "14px",
              }}
            >
              {/* Active Bottom Line Indicator */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] z-10"
                  style={{ backgroundColor: "var(--accent-primary)" }}
                />
              )}

              <FileCode
                size={15}
                className={`mr-2.5 flex-shrink-0 ${isActive ? "text-amber-500" : "text-[var(--text-muted)]"}`}
              />

              {isEditing ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleFinishRename(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFinishRename(tab.id);
                    if (e.key === "Escape") setEditingTabId(null);
                  }}
                  autoFocus
                  className="bg-[var(--bg-input)] text-[var(--text-primary)] text-xs px-1.5 py-0.5 rounded outline-none border border-[var(--accent-primary)] w-28"
                />
              ) : (
                <span className="truncate max-w-[180px]">{tab.title}</span>
              )}

              {tab.isModified && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 ml-2" />
              )}

              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors ml-2.5"
                  title="Close Tab"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Half-size height divider between tabs */}
            {index < tabs.length - 1 && (
              <div
                className="h-5 w-[1px] flex-shrink-0 self-center"
                style={{
                  backgroundColor: "var(--border-color)",
                  opacity: 0.75,
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Add Tab Button with margin */}
      <button
        onClick={onAddTab}
        title="New JSON Document (Ctrl+N)"
        className="p-1.5 px-3 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 text-xs ml-1.5"
      >
        <Plus size={15} />
      </button>
    </div>
  );
};
