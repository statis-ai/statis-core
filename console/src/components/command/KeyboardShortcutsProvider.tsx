"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CommandPalette } from "./CommandPalette";
import { ShortcutHelp } from "./ShortcutHelp";

// Routes bound to `g+X` navigation chords
const NAV_CHORDS: Record<string, string> = {
  h: "/home",
  a: "/actions",
  e: "/escalations",
  p: "/policies",
  c: "/adapters",
  r: "/receipts",
  o: "/agents", // "o" for agents (a/e/p are taken)
  s: "/settings",
  d: "/developers",
  t: "/threat-logs",
  k: "/kill-switch",
  w: "/webhooks",
};

// Routes bound to `c+X` create chords (navigates to the page with a `?new=1` query)
const CREATE_CHORDS: Record<string, string> = {
  p: "/policies?new=1",
  a: "/agents?new=1",
  c: "/adapters?new=1",
};

const CHORD_TIMEOUT_MS = 1200;

// Returns true if the user is currently typing in an input, textarea, or contenteditable.
function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (t.isContentEditable) return true;
  return false;
}

export function KeyboardShortcutsProvider() {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Tracks the first key of a chord, e.g. "g" waiting for "a"
  const pendingChord = useRef<"g" | "c" | null>(null);
  const chordTimer = useRef<number | null>(null);

  const clearChord = useCallback(() => {
    pendingChord.current = null;
    if (chordTimer.current !== null) {
      window.clearTimeout(chordTimer.current);
      chordTimer.current = null;
    }
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // ⌘K / Ctrl+K → command palette (always available)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        clearChord();
        return;
      }

      // If the palette or help is open, let the dialog handle its own keys
      if (paletteOpen || helpOpen) return;

      // Never hijack keys while the user is typing in an input
      if (isEditableTarget(e.target)) return;

      // Don't interfere with modifier-based shortcuts we don't own
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      // "?" opens the shortcut help (Shift + /)
      if (key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        clearChord();
        return;
      }

      // Chord second-key resolution
      if (pendingChord.current === "g") {
        const route = NAV_CHORDS[key.toLowerCase()];
        clearChord();
        if (route) {
          e.preventDefault();
          router.push(route);
        }
        return;
      }

      if (pendingChord.current === "c") {
        const route = CREATE_CHORDS[key.toLowerCase()];
        clearChord();
        if (route) {
          e.preventDefault();
          router.push(route);
        }
        return;
      }

      // Start a chord
      if (key === "g" || key === "c") {
        pendingChord.current = key as "g" | "c";
        chordTimer.current = window.setTimeout(clearChord, CHORD_TIMEOUT_MS);
        return;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (chordTimer.current !== null) window.clearTimeout(chordTimer.current);
    };
  }, [router, paletteOpen, helpOpen, clearChord]);

  return (
    <>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
