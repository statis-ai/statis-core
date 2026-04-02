"use client";

import { useState } from "react";
import EntityLookup from "@/components/entity-lookup";
import StateTab from "@/components/tabs/state-tab";
import TimelineTab from "@/components/tabs/timeline-tab";
import ActionsTab from "@/components/tabs/actions-tab";
import ReceiptTab from "@/components/tabs/receipt-tab";
import DiffTab from "@/components/tabs/diff-tab";
import DeliveriesTab from "@/components/tabs/deliveries-tab";

const TABS = [
  "State",
  "Timeline",
  "Actions",
  "Receipt",
  "Diff",
  "Deliveries",
] as const;

type Tab = (typeof TABS)[number];

export default function EntitiesPage() {
  const [entityType, setEntityType] = useState<string | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("State");
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  function handleInspect(type: string, id: string) {
    setEntityType(type);
    setEntityId(id);
    setActiveTab("State");
    setSelectedActionId(null);
    setLookupLoading(false);
  }

  function renderTab() {
    if (!entityType || !entityId) return null;

    switch (activeTab) {
      case "State":
        return <StateTab entityType={entityType} entityId={entityId} />;
      case "Timeline":
        return <TimelineTab entityType={entityType} entityId={entityId} />;
      case "Actions":
        return (
          <ActionsTab
            entityType={entityType}
            entityId={entityId}
            selectedActionId={selectedActionId}
            onSelectAction={(id) => setSelectedActionId(id)}
          />
        );
      case "Receipt":
        return <ReceiptTab actionId={selectedActionId} />;
      case "Diff":
        return <DiffTab entityType={entityType} entityId={entityId} />;
      case "Deliveries":
        return <DeliveriesTab entityType={entityType} entityId={entityId} />;
      default:
        return null;
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-white">Entities</h1>
        <p className="text-xs text-[#444444] mt-0.5">
          Inspect entity state, events, and action history
        </p>
      </div>

      {/* Lookup */}
      <div className="mb-8">
        <EntityLookup onInspect={handleInspect} loading={lookupLoading} />
      </div>

      {/* Entity detail */}
      {entityType && entityId ? (
        <div>
          {/* Entity header */}
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-sm text-[#d4d4d4]">
              {entityType}
            </span>
            <span className="text-[#444444]">/</span>
            <span className="font-mono text-sm text-white">{entityId}</span>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 mb-6 border-b border-[#1a1a1a] pb-px">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === tab
                    ? "bg-white/[0.06] text-[#d4d4d4]"
                    : "text-[#444444] hover:text-[#888888]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>{renderTab()}</div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-24">
          <p className="text-sm text-[#444444]">
            Enter an entity type and ID to inspect its state, events, and action
            history.
          </p>
        </div>
      )}
    </div>
  );
}
