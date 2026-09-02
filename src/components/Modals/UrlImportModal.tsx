"use client";

import React, { useState } from "react";
import { Globe, X, Loader2, AlertCircle } from "lucide-react";
import { formatJson } from "@/lib/json-parser";

interface UrlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string, title?: string) => void;
}

export const UrlImportModal: React.FC<UrlImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleEndpoints = [
    { label: "GitHub Users API", url: "https://api.github.com/users/octocat" },
    { label: "FakeStore Products API", url: "https://fakestoreapi.com/products?limit=5" },
    { label: "JSONPlaceholder Todo API", url: "https://jsonplaceholder.typicode.com/todos/1" },
  ];

  const handleFetch = async (targetUrl?: string) => {
    const fetchUrl = targetUrl || url;
    if (!fetchUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const formatted = formatJson(data, 2);

      // Extract a meaningful tab name from URL
      const urlObj = new URL(fetchUrl);
      const pathname = urlObj.pathname.split("/").filter(Boolean).pop() || "api_data";
      onImport(formatted, `${pathname}.json`);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch URL. Check CORS or URL validity."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-2xl border overflow-hidden animate-slide-down"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-cyan-400" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">Import JSON from URL / API</span>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 font-mono text-xs">
          <div>
            <label className="text-[var(--text-muted)] block mb-1">Enter API Endpoint / JSON URL:</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/data.json"
              className="w-full bg-[var(--bg-input)] text-white px-3 py-2 rounded outline-none border border-[var(--border-color)] focus:border-[var(--accent-primary)]"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] text-[var(--text-muted)] block mb-1 font-sans">Quick Sample Endpoints:</span>
            <div className="flex flex-col gap-1">
              {sampleEndpoints.map((ep) => (
                <button
                  key={ep.url}
                  onClick={() => {
                    setUrl(ep.url);
                    handleFetch(ep.url);
                  }}
                  className="text-left px-2 py-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white flex items-center justify-between border border-[var(--border-subtle)] transition-colors"
                >
                  <span className="truncate">{ep.label}</span>
                  <span className="text-[10px] text-[var(--accent-primary)]">Fetch ↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-[var(--bg-primary)]" style={{ borderColor: "var(--border-color)" }}>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded hover:bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)]"
          >
            Cancel
          </button>
          <button
            onClick={() => handleFetch()}
            disabled={loading || !url.trim()}
            className="px-4 py-1.5 rounded bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
            <span>{loading ? "Fetching..." : "Fetch & Load"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
