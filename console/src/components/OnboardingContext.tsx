"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Industry =
  | "fintech"
  | "saas"
  | "ecommerce"
  | "healthcare"
  | "logistics"
  | "other";

export type ActionType =
  | "issue_refund"
  | "apply_discount"
  | "send_notification"
  | "provision_instance"
  | "update_account"
  | "create_ticket"
  | "trigger_webhook"
  | "schedule_task"
  | "flag_for_review";

export type ProductionSystem =
  | "stripe"
  | "salesforce"
  | "zendesk"
  | "hubspot"
  | "aws"
  | "custom";

interface OnboardingState {
  industry: Industry | null;
  actions: ActionType[];
  systems: ProductionSystem[];
}

interface OnboardingContextValue extends OnboardingState {
  setIndustry: (industry: Industry) => void;
  toggleAction: (action: ActionType) => void;
  toggleSystem: (system: ProductionSystem) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window === "undefined") return { industry: null, actions: [], systems: [] };
    try {
      const saved = localStorage.getItem("statis_onboarding_state");
      return saved ? JSON.parse(saved) : { industry: null, actions: [], systems: [] };
    } catch {
      return { industry: null, actions: [], systems: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem("statis_onboarding_state", JSON.stringify(state));
  }, [state]);

  const setIndustry = (industry: Industry) =>
    setState((s) => ({ ...s, industry }));

  const toggleAction = (action: ActionType) =>
    setState((s) => ({
      ...s,
      actions: s.actions.includes(action)
        ? s.actions.filter((a) => a !== action)
        : [...s.actions, action],
    }));

  const toggleSystem = (system: ProductionSystem) =>
    setState((s) => ({
      ...s,
      systems: s.systems.includes(system)
        ? s.systems.filter((sys) => sys !== system)
        : [...s.systems, system],
    }));

  return (
    <OnboardingContext.Provider
      value={{ ...state, setIndustry, toggleAction, toggleSystem }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
