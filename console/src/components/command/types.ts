import type { ReactNode } from "react";

export type CommandSection = "navigate" | "create" | "actions" | "policies" | "receipts" | "theme";

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
  shortcut?: string[];
  keywords?: string[];
  run: (ctx: CommandContext) => void | Promise<void>;
  when?: (ctx: CommandContext) => boolean;
};

export const SECTION_LABELS: Record<CommandSection, string> = {
  navigate: "Navigate",
  create: "Create",
  actions: "Actions",
  policies: "Policies",
  receipts: "Receipts",
  theme: "Preferences",
};
