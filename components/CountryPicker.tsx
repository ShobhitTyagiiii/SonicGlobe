"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Country } from "@/lib/types";

interface CountryPickerProps {
  open: boolean;
  countries: Country[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
}

/**
 * A searchable country list. Works as a reliable, globe-independent way to pick
 * a country (and the fallback when the 3D globe can't run). Filter by name or
 * code; click a country to hear its top songs.
 */
export default function CountryPicker({
  open,
  countries,
  selectedCode,
  onSelect,
  onClose,
}: CountryPickerProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset + focus the search whenever the picker opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q),
    );
  }, [query, countries]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh] sm:pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="glass-strong glass-edge relative flex max-h-[72vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl shadow-glass"
          >
            {/* Header / search */}
            <div className="border-b border-white/10 p-4">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">
                  Explore countries
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth={2} strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-white/40"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a country…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/40"
                />
              </div>
            </div>

            {/* Country grid */}
            <div className="scroll-fade grid grid-cols-2 gap-1.5 overflow-y-auto p-3 sm:grid-cols-3">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onSelect(c.code);
                    onClose();
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    c.code === selectedCode
                      ? "bg-accent/15 ring-1 ring-accent/40"
                      : "hover:bg-white/[0.07]"
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="truncate text-sm font-medium text-white/85">
                    {c.name}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-white/40">
                  No countries match “{query}”.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
