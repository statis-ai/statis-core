"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Code2, Activity, LogOut, Hexagon } from "lucide-react";
import EntityLookup from "@/components/entity-lookup";
import StateTab from "@/components/tabs/state-tab";
import TimelineTab from "@/components/tabs/timeline-tab";
import DiffTab from "@/components/tabs/diff-tab";
import DeliveriesTab from "@/components/tabs/deliveries-tab";
import ActionsTab from "@/components/tabs/actions-tab";
import ReceiptTab from "@/components/tabs/receipt-tab";
import DevelopersTab from "@/components/tabs/developers-tab";

const INSPECTOR_TABS = ["State", "Timeline", "Diff", "Deliveries", "Actions", "Receipt"] as const;
type InspectorTab = (typeof INSPECTOR_TABS)[number];

const NAV_ITEMS = [
  { id: "inspector", label: "Inspector", icon: Search },
  { id: "events", label: "Events Feed", icon: Activity },
  { id: "developers", label: "Developers", icon: Code2 },
] as const;
type NavItem = (typeof NAV_ITEMS)[number]["id"];

export default function ConsoleLayout() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<NavItem>("inspector");
  const [isApiHealthy, setIsApiHealthy] = useState(true);

  // Inspector state
  const [entity, setEntity] = useState<{ type: string; id: string } | null>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>("State");
  const [loading, setLoading] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("statis_api_key");
    if (!key) {
      router.push("/signup");
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`)
      .then(res => setIsApiHealthy(res.ok))
      .catch(() => setIsApiHealthy(false));
  }, [router]);

  function handleInspect(entityType: string, entityId: string) {
    setLoading(true);
    setEntity({ type: entityType, id: entityId });
    setActiveTab("State");
    setSelectedActionId(null);
    setTimeout(() => setLoading(false), 100);
  }

  function handleSelectAction(actionId: string) {
    setSelectedActionId(actionId);
    setActiveTab("Receipt");
  }

  function handleLogout() {
    localStorage.removeItem("statis_api_key");
    localStorage.removeItem("statis_tenant_id");
    router.push("/signup");
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-brand-accent/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-brand-border bg-brand-surface/40 backdrop-blur-xl flex flex-col z-10 transition-all shadow-xl">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hexagon className="w-6 h-6 text-brand-accent fill-brand-accent/20" />
            <span className="font-bold text-white tracking-tight text-lg">Statis</span>
          </div>
        </div>

        <div className="p-4 flex-1">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-brand-muted/70 uppercase tracking-wider mb-2">Platform</p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${isActive
                      ? "bg-brand-accent/10 text-brand-accent font-medium shadow-[inset_2px_0_0_0_#10b981]"
                      : "text-brand-muted hover:bg-black/40 hover:text-white"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-accent" : "opacity-70"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center justify-between px-3 py-2 bg-black/40 rounded-md border border-brand-border/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isApiHealthy ? "bg-emerald-500 text-emerald-500" : "bg-red-500 text-red-500 animate-pulse"}`} />
              <span className="text-xs font-medium text-brand-muted">
                {isApiHealthy ? "API Connected" : "API Offline"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center gap-2 text-xs text-brand-muted hover:text-red-400 p-2 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto p-10">

          {/* INSPECTOR VIEW */}
          {activeNav === "inspector" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">Account Inspector</h1>
                <p className="mt-1 text-sm text-brand-muted">Inspect entity state, events, webhook deliveries, and action receipts.</p>
              </header>

              <section className="mb-8 relative z-20">
                <EntityLookup onInspect={handleInspect} loading={loading} />
              </section>

              {entity ? (
                <div className="bg-brand-surface/30 border border-brand-border rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl">
                  {/* Tab bar */}
                  <div className="flex border-b border-brand-border bg-black/20 overflow-x-auto">
                    {INSPECTOR_TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${activeTab === tab
                            ? "border-brand-accent text-brand-accent bg-brand-accent/5"
                            : "border-transparent text-brand-muted hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {tab}
                        {tab === "Receipt" && selectedActionId && (
                          <span className="ml-1.5 text-[10px] text-brand-accent">●</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div className="p-0">
                    {activeTab === "State" && (
                      <div className="p-6">
                        <StateTab entityType={entity.type} entityId={entity.id} />
                      </div>
                    )}
                    {activeTab === "Timeline" && (
                      <div className="p-6">
                        <TimelineTab entityType={entity.type} entityId={entity.id} />
                      </div>
                    )}
                    {activeTab === "Diff" && (
                      <div className="p-6">
                        <DiffTab entityType={entity.type} entityId={entity.id} />
                      </div>
                    )}
                    {activeTab === "Deliveries" && (
                      <DeliveriesTab entityType={entity.type} entityId={entity.id} />
                    )}
                    {activeTab === "Actions" && (
                      <ActionsTab
                        entityType={entity.type}
                        entityId={entity.id}
                        selectedActionId={selectedActionId}
                        onSelectAction={handleSelectAction}
                      />
                    )}
                    {activeTab === "Receipt" && (
                      <ReceiptTab actionId={selectedActionId} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-12">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-brand-surface/40 border border-brand-border p-6 rounded-xl backdrop-blur-sm">
                      <h3 className="text-brand-muted text-xs font-semibold uppercase tracking-wider">Total Events Ingested</h3>
                      <p className="text-3xl font-bold text-white mt-2">1.2M</p>
                    </div>
                    <div className="bg-brand-surface/40 border border-brand-border p-6 rounded-xl backdrop-blur-sm">
                      <h3 className="text-brand-muted text-xs font-semibold uppercase tracking-wider">Active Entities</h3>
                      <p className="text-3xl font-bold text-white mt-2">450K</p>
                    </div>
                    <div className="bg-brand-surface/40 border border-brand-border p-6 rounded-xl backdrop-blur-sm">
                      <h3 className="text-brand-muted text-xs font-semibold uppercase tracking-wider">Webhooks Fired</h3>
                      <p className="text-3xl font-bold text-white mt-2">3.8M</p>
                    </div>
                  </div>
                  <div className="mt-8 text-center py-16 border border-dashed border-brand-border rounded-xl bg-brand-surface/20">
                    <Search className="w-8 h-8 text-brand-muted mx-auto mb-3 opacity-50" />
                    <p className="text-lg text-brand-muted font-medium">Search for an entity above to inspect its lifecycle</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEVELOPERS VIEW */}
          {activeNav === "developers" && <DevelopersTab />}

          {/* EVENTS FEED VIEW */}
          {activeNav === "events" && (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <Activity className="w-12 h-12 text-brand-accent/50 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Global Events Feed</h2>
              <p className="text-brand-muted mt-2">Streaming real-time events across your tenant... (Coming Soon)</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
