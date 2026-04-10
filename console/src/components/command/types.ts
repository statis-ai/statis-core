import type { ReactNode } from "react";

export type CommandSection = "navigate" | "create" | "action" | "search" | "theme";

export type CommandContext = {
  router: { push: (href: string) => void };
  pathname: string;
  toggleTheme: () => void;
};

export type Command = {
  id: string;
  title: string;
  subtitle?: string;
  section: CommandSection;
  icon?: ReactNode;
  // Human-readable shortcut, e.g. ["g", "a"] or ["⌘", "K"]
  shortcut?: string[];
  // Synonyms that match against the user's query (never displayed)
  keywords?: string[];
  run: (ctx: CommandContext) => void | Promise<void>;
  // Hide command when predicate returns false
  when?: (ctx: CommandContext) => boolean;
};

export const SECTION_LABELS: Record<CommandSection, string> = {
  navigate: "Navigate",
  create: "Create",
  action: "Actions",
  search: "Search",
  theme: "Preferences",
};
