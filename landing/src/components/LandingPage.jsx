"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ==========================================================================
   1. DATA CONSTANTS
   ========================================================================== */

const FAQS = [
  {
    q: "What is Shadow Mode?",
    a: "Shadow mode lets you run Statis alongside your existing agents without changing a single line of agent code. Statis observes every action proposal, evaluates it against your policy rules, and flags what would have been DENIED or DUPLICATE \u2014 without blocking any execution. Zero production risk. Zero integration work. Purpose-built for design partners evaluating Statis before full adoption.",
  },
  {
    q: "How is Statis different from a vector database?",
    a: "Vector databases are for semantic retrieval \u2014 memory. Statis is for deterministic structured state and governed execution \u2014 reality. If an agent needs context, use RAG. If it needs to know what\u2019s true right now and act on it safely, it needs Statis.",
  },
  {
    q: "Do I need to rewrite my agent logic?",
    a: "No. Statis sits between your agents and your production systems. Your agents propose actions via a simple API. Statis handles evaluation, execution, and receipts. Minimal changes to existing agent code.",
  },
  {
    q: "What makes the Policy Engine different from an authorization layer?",
    a: 'Authorization answers "can this agent do this?" Statis answers "given the current state of this entity and its history, should this action happen right now?" The policy evaluates entity state, not just roles \u2014 and every decision is receipted against a versioned rule.',
  },
  {
    q: "How does exactly-once execution work?",
    a: "When an action is approved, Statis acquires a distributed lock on the action ID, calls the adapter, writes the receipt atomically, and releases the lock. If any agent retries with the same action ID \u2014 even concurrently \u2014 the receipt is found and execution is blocked. The external system is never called twice.",
  },
  {
    q: "Can I self-host Statis?",
    a: "Yes. Statis ships with a Docker Compose setup for self-hosted deployment. VPC and managed hosting options are also on the roadmap for enterprise design partners. If data residency is a requirement, reach out directly.",
  },
  {
    q: "How fast is state materialization?",
    a: "Sub-second in normal operation. State is materialized and pushed to subscribers in near real-time. The reducer pattern ensures state is always derived from the canonical event log, not from polling or caching.",
  },
];

const PRINCIPLES = [
  { num: "01", title: "Determinism over ML.", desc: "Your governance layer shouldn\u2019t hallucinate. Rules are versioned, testable, reversible \u2014 no magic, no prompts in the critical path." },
  { num: "02", title: "Audit is the product.", desc: "The ledger isn\u2019t a feature, it\u2019s the thing you\u2019re paying for. Every receipt tamper-evident, queryable, and exportable." },
  { num: "03", title: "Operator-first tooling.", desc: "SDKs, CLIs, and infrastructure-as-code. No required dashboard. Built for the people who actually own production." },
  { num: "04", title: "Self-hostable by default.", desc: "Docker Compose, bring your own database, run on your own metal. No vendor lock-in on the trust layer." },
  { num: "05", title: "Reversible by design.", desc: "Every policy versioned, every decision explainable, every action undoable. Mistakes should be recoverable, not catastrophic." },
];

const ERROR_LINES = [
  { ts: "09:23:11.204", key: "action_id", val: "act-7f3a1c" },
  { ts: "09:23:11.206", key: "adapter", val: "stripe.charge" },
  { ts: "09:23:11.207", key: "amount", val: "$299.00" },
  { ts: "09:23:11.441", key: "executions", val: "2  \u2190 fired twice", warn: true },
  { ts: "09:23:11.442", key: "receipt", val: "none", muted: true },
  { ts: "09:23:11.442", key: "audit_trail", val: "none", muted: true },
  { ts: "09:23:11.443", key: "status", val: "UNKNOWN", muted: true },
];

const PROBLEMS = [
  { problem: "Agent retries charge customer twice", fix: "Exactly-once execution lock" },
  { problem: "No visibility into what ran or why", fix: "SHA-256 receipt on every action" },
  { problem: "No way to stop a rogue action mid-flight", fix: "Policy engine evaluates before execution" },
];

const SIDEBAR_ITEMS = [
  { group: null, items: [{ name: "Home", active: true }, { name: "Inbox", badge: "4", active: false }] },
  { group: "OBSERVE", items: [{ name: "Actions" }, { name: "Receipts" }, { name: "Entities" }] },
  { group: "GOVERN", items: [{ name: "Policies" }, { name: "Escalations", badge: "2" }] },
  { group: "CONNECT", items: [{ name: "Adapters" }, { name: "Webhooks" }] },
];

const METRICS = [
  { label: "Actions Today", value: 12847, display: "12,847", sub: "+1,203 vs yesterday" },
  { label: "Execution Rate", value: 99.97, display: "99.97%", sub: "of committed", isPercent: true },
  { label: "Escalations", value: 3, display: "3", sub: "awaiting review" },
  { label: "Receipts Minted", value: 1.28, display: "1.28M", sub: "all time", suffix: "M" },
];

const ACTIONS_DATA = [
  { id: "act-f93a", entity: "svc-landing", entityColor: "#A78BFA", action: "deploy_landing_page", status: "COMPLETED", rule: "infra_deploy_v1", time: "4s ago" },
  { id: "act-e41b", entity: "svc-api", entityColor: "#34D399", action: "run_test_suite", status: "COMPLETED", rule: "ci_gate_v1", time: "12s ago" },
  { id: "act-d28c", entity: "svc-infra", entityColor: "#FACC15", action: "update_dns_record", status: "ESCALATED", rule: "infra_change_v2", time: "1m ago", selected: true },
  { id: "act-c77d", entity: "svc-comms", entityColor: "#60A5FA", action: "send_slack_alert", status: "COMPLETED", rule: "comms_policy_v1", time: "3m ago" },
  { id: "act-b19e", entity: "svc-api", entityColor: "#34D399", action: "scale_api_workers", status: "COMPLETED", rule: "infra_deploy_v1", time: "7m ago" },
];

const STATUS_COLORS = {
  COMPLETED: { color: "#34D399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.28)" },
  ESCALATED: { color: "#FACC15", bg: "rgba(250,204,21,0.10)", border: "rgba(250,204,21,0.25)" },
  DENIED: { color: "#F87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.22)" },
};

const FILTERS = [
  { name: "All", count: "12,847", active: true },
  { name: "Completed", count: "12,802" },
  { name: "Escalated", count: "3" },
  { name: "Denied", count: "42" },
];

const CODE_TOKENS = [
  [{ t: "from", c: "#C4B5FD" }, { t: " statis_ai ", c: "#E4E4E7" }, { t: "import", c: "#C4B5FD" }, { t: " StatisClient", c: "#D4D4D8" }],
  [],
  [{ t: "client", c: "#E4E4E7" }, { t: " = ", c: "#A1A1AA" }, { t: "StatisClient", c: "#D4D4D8" }, { t: "(api_key=", c: "#E4E4E7" }, { t: '"sk-statis-..."', c: "#D4A574" }, { t: ")", c: "#E4E4E7" }],
  [],
  [{ t: "# Propose an action \u2014 nothing executes yet", c: "#6B7280" }],
  [{ t: "action", c: "#E4E4E7" }, { t: " = await ", c: "#A1A1AA" }, { t: "client", c: "#E4E4E7" }, { t: ".", c: "#A1A1AA" }, { t: "propose", c: "#E8813A" }, { t: "(", c: "#A1A1AA" }],
  [{ t: "    entity_id", c: "#A1A1AA" }, { t: "=", c: "#A1A1AA" }, { t: '"acct-8821"', c: "#D4A574" }, { t: ",", c: "#A1A1AA" }],
  [{ t: "    action_type", c: "#A1A1AA" }, { t: "=", c: "#A1A1AA" }, { t: '"apply_discount"', c: "#D4A574" }, { t: ",", c: "#A1A1AA" }],
  [{ t: "    payload", c: "#A1A1AA" }, { t: "={", c: "#A1A1AA" }, { t: '"percent"', c: "#D4A574" }, { t: ": ", c: "#A1A1AA" }, { t: "15", c: "#E8813A" }, { t: ', "reason": ', c: "#A1A1AA" }, { t: '"churn_risk"', c: "#D4A574" }, { t: "},", c: "#A1A1AA" }],
  [{ t: ")", c: "#E4E4E7" }],
  [],
  [{ t: "# Policy engine evaluates. Execute if approved.", c: "#6B7280" }],
  [{ t: "if", c: "#C4B5FD" }, { t: " action.status", c: "#E4E4E7" }, { t: " == ", c: "#A1A1AA" }, { t: '"APPROVED"', c: "#D4A574" }, { t: ":", c: "#A1A1AA" }],
  [{ t: "    receipt", c: "#E4E4E7" }, { t: " = await ", c: "#A1A1AA" }, { t: "action", c: "#E4E4E7" }, { t: ".", c: "#A1A1AA" }, { t: "execute", c: "#E8813A" }, { t: "()", c: "#E4E4E7" }],
  [{ t: "    ", c: "#E4E4E7" }, { t: "print", c: "#D4D4D8" }, { t: "(receipt.id)", c: "#E4E4E7" }, { t: "  # sha256:a3f29c...", c: "#6B7280" }],
];

const ENTERPRISE_BADGES = [
  {
    title: "SOC 2 Type II",
    sub: "Audit in progress. Security controls across access, availability, and confidentiality.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    title: "OIDC SSO",
    sub: "Native Okta, Entra ID, and any OIDC-compliant provider. SCIM provisioning included.",
    icon: "M3 11h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11zm4-4a5 5 0 0 1 10 0v4H7V7z",
  },
  {
    title: "Self-hostable",
    sub: "Deploy on your own infrastructure with Docker Compose. No data leaves your VPC.",
    icon: "M2 3h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3zm6 18h8M12 17v4",
  },
  {
    title: "Tamper-evident Receipts",
    sub: "Every action produces a SHA-256 signed receipt. Immutable. Auditable. Cryptographically verifiable.",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    title: "Data Residency",
    sub: "Choose your region. On-prem deployment available for regulated industries.",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z",
  },
  {
    title: "Full Audit Logs",
    sub: "Complete decision history. Every policy evaluation, every escalation, every outcome \u2014 forever.",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8",
  },
];

const ROW_ONE = [
  { name: "OpenAI", color: "#8c8c8c", path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" },
  { name: "Anthropic", color: "#c4906a", path: "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" },
  { name: "GitHub", color: "#9a9a9a", path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
  { name: "Slack", color: "#6a9080", path: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" },
  { name: "Stripe", color: "#7087b8", path: "M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" },
  { name: "Linear", color: "#7878c8", path: "M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" },
  { name: "Notion", color: "#949494", path: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" },
  { name: "Vercel", color: "#999999", path: "m12 1.608 12 20.784H0Z" },
  { name: "Snowflake", color: "#5a96b8", path: "M23.772 17.374a.5262.5262 0 0 0-.201-.718l-1.967-1.136 1.019-.278a.527.527 0 1 0-.277-1.017l-1.929.526-3.537-2.042 3.537-2.042 1.929.526a.5276.5276 0 0 0 .648-.37.527.527 0 0 0-.37-.648l-1.019-.278 1.967-1.136a.527.527 0 1 0-.527-.912L21.077 9.01l.278-1.019a.527.527 0 1 0-1.017-.278l-.526 1.929-3.537 2.042v-4.08l1.403-1.403a.527.527 0 1 0-.745-.745l-.658.658V4.095a.527.527 0 0 0-1.054 0v1.019l-.658-.658a.527.527 0 0 0-.745.745l1.403 1.403v4.08L11.685 8.64l-.526-1.929a.527.527 0 0 0-1.017.278l.278 1.019-1.968-1.136a.527.527 0 1 0-.527.912l1.968 1.136-1.019.278a.527.527 0 1 0 .278 1.017l1.929-.526 3.537 2.042-3.537 2.042-1.929-.526a.5276.5276 0 0 0-.648.37.527.527 0 0 0 .37.648l1.019.278-1.968 1.136a.527.527 0 1 0 .527.912l1.968-1.136-.278 1.019a.527.527 0 1 0 1.017.278l.526-1.929 3.537-2.042v4.08l-1.403 1.403a.527.527 0 1 0 .745.745l.658-.658v1.019a.527.527 0 0 0 1.054 0v-1.019l.658.658a.527.527 0 0 0 .745-.745l-1.403-1.403v-4.08l3.537 2.042.526 1.929a.527.527 0 1 0 1.017-.278l-.278-1.019 1.967 1.136a.527.527 0 0 0 .718-.201z" },
  { name: "Jira", color: "#4a80b8", path: "M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" },
  { name: "Datadog", color: "#b87840", path: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.08c-.337.43-2.22.206-3.074.103-.255-.032-.295.192-.063.36 1.5 1.053 3.967.75 4.254.399.287-.36-.08-2.826-1.485-4.007-.215-.184-.423-.088-.327.151.32.79 1.03 2.57.695 2.994zM6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103a3.9 3.9 0 0 0-.862.272 2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm13.035 6.171c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607z" },
];

const ROW_TWO = [
  { name: "AWS", color: "#b87830", path: "M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z" },
  { name: "Kubernetes", color: "#4a7ab8", path: "M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm.76 2.75l.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.779zm1.5-3.095a.44.44 0 0 0 .7.336l.008.003 2.134-1.513a5.188 5.188 0 0 0-2.992-1.442l.148 2.615.002.001zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" },
  { name: "HubSpot", color: "#c07050", path: "M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z" },
  { name: "PostgreSQL", color: "#5a7ab8", path: "M23.5594 14.7228a.5269.5269 0 0 0-.0563-.1191c-.139-.2632-.4768-.3418-1.0074-.2321-1.6533.3411-2.2935.1312-2.5256-.0191 1.342-2.0482 2.445-4.522 3.0411-6.8297.2714-1.0507.7982-3.5237.1222-4.7316a1.5641 1.5641 0 0 0-.1509-.235C21.6931.9086 19.8007.0248 17.5099.0005c-1.4947-.0158-2.7705.3461-3.1161.4794a9.449 9.449 0 0 0-.5159-.0816 8.044 8.044 0 0 0-1.3114-.1278c-1.1822-.0184-2.2038.2642-3.0498.8406-.8573-.3211-4.7888-1.645-7.2219.0788C.9359 2.1526.3086 3.8733.4302 6.3043c.0409.818.5069 3.334 1.2423 5.7436.4598 1.5065.9387 2.7019 1.4334 3.582.553.9942 1.1259 1.5933 1.7143 1.7895.4474.1491 1.1327.1441 1.8581-.7279.8012-.9635 1.5903-1.8258 1.9446-2.2069.4351.2355.9064.3625 1.39.3772z" },
  { name: "MongoDB", color: "#5a9860", path: "M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z" },
  { name: "Zapier", color: "#c06040", path: "M159.6 78.1h32.6v9h-32.6z" },
  { name: "n8n", color: "#c06868", path: "M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623c-.203-1.218-1.257-2.111-2.492-2.111h-.3175c.203-1.218 1.257-2.111 2.492-2.111h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263z" },
  { name: "Mistral AI", color: "#8878b8", path: "M17.143 3.429v3.428h-3.429v3.429h-3.428V6.857H6.857V3.43H3.43v13.714H0v3.428h10.286v-3.428H6.857v-3.429h3.429v3.429h3.429v-3.429h3.428v3.429h-3.428v3.428H24v-3.428h-3.43V3.429z" },
  { name: "Gemini", color: "#5a78b8", path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" },
  { name: "Cursor", color: "#909090", path: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" },
  { name: "LangChain", color: "#7aaa7a", path: "M7.53 15.975a7.53 7.53 0 0 0 2.206-5.325A7.54 7.54 0 0 0 7.53 5.325L2.205 0A7.54 7.54 0 0 0 0 5.325a7.54 7.54 0 0 0 2.205 5.325zm11.144.493a7.54 7.54 0 0 0-5.325-2.206 7.54 7.54 0 0 0-5.325 2.206l5.325 5.325a7.54 7.54 0 0 0 5.325 2.205A7.54 7.54 0 0 0 24 21.793z" },
];

const FOOTER_LINKS = {
  Product: [
    { label: "Console", href: "https://console.statis.dev", external: true },
    { label: "Docs", href: "https://docs.statis.dev", external: true },
    { label: "Changelog", href: "/changelog" },
    { label: "Method", href: "#method" },
  ],
  Developers: [
    { label: "GitHub", href: "https://github.com/statis-ai/statis-sdk", external: true },
    { label: "Python SDK", href: "https://pypi.org/project/statis-ai/", external: true },
    { label: "TypeScript SDK", href: "https://www.npmjs.com/package/statis-ai", external: true },
    { label: "API Reference", href: "https://docs.statis.dev/api", external: true },
    { label: "Self-host", href: "https://docs.statis.dev/self-host", external: true },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Integrations", href: "/integrations" },
    { label: "MCP Connectors", href: "/mcp" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Enterprise", href: "https://www.surveymonkey.com/r/GVKH2KR", external: true },
    { label: "Contact", href: "mailto:hello@statis.dev" },
  ],
  Legal: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Security", href: "/security" },
  ],
};

/* ==========================================================================
   2. CUSTOM HOOKS
   ========================================================================== */

function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.disconnect(); } },
      { threshold: options.threshold || 0.15, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, isVisible];
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          setProgress(h > 0 ? window.scrollY / h : 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function useCountUp(end, duration, shouldStart, isPercent, suffix) {
  const [value, setValue] = useState(0);
  const hasRun = useRef(false);
  useEffect(() => {
    if (!shouldStart || hasRun.current) return;
    hasRun.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(eased * end);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [shouldStart, end, duration]);

  if (isPercent) return value.toFixed(2) + "%";
  if (suffix) return value.toFixed(2) + suffix;
  return Math.round(value).toLocaleString();
}

function useCardTilt() {
  const ref = useRef(null);
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  }, []);
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
  }, []);
  return { ref, onMouseMove, onMouseLeave };
}

function useMagnetic() {
  const ref = useRef(null);
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      const pull = (1 - dist / 80) * 4;
      el.style.transform = `translate(${dx * pull / 20}px, ${dy * pull / 20}px)`;
    }
  }, []);
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0,0)";
  }, []);
  return { ref, onMouseMove, onMouseLeave };
}

/* ==========================================================================
   3. SUB-COMPONENTS
   ========================================================================== */

function ScrollProgressBar() {
  const progress = useScrollProgress();
  return (
    <div className="lp-progress-bar" style={{ width: `${progress * 100}%` }} />
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mag = useMagnetic();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
      <nav className="lp-nav-inner">
        <a href="/" className="lp-logo">
          statis<span className="lp-logo-dot">.</span>
        </a>

        <button className="lp-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`lp-nav-links ${menuOpen ? "lp-nav-links--open" : ""}`}>
          <a href="https://docs.statis.dev" target="_blank" rel="noopener noreferrer">Docs</a>
          <a href="https://github.com/statis-ai/statis-sdk" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://console.statis.dev/playground" target="_blank" rel="noopener noreferrer">Playground</a>
          <a href="#method">Method</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="lp-nav-actions">
          <a href="https://console.statis.dev/auth?mode=login" className="lp-nav-login">Log In</a>
          <a
            href="https://console.statis.dev/auth?mode=signup"
            className="lp-btn-primary"
            ref={mag.ref}
            onMouseMove={mag.onMouseMove}
            onMouseLeave={mag.onMouseLeave}
          >
            Get Access
          </a>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  const [revealed, setRevealed] = useState(false);
  const mag1 = useMagnetic();
  const [dotPos, setDotPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  const onHeroMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDotPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const lines = ["The execution layer", "for production", "AI agents."];
  const steps = ["Propose", "Evaluate", "Execute \u00d71", "Receipt"];

  return (
    <section className="lp-hero" onMouseMove={onHeroMouseMove}>
      <div className="lp-hero-gradient-mesh" />
      <div
        className="lp-dot-grid"
        style={{ "--dot-x": `${dotPos.x}px`, "--dot-y": `${dotPos.y}px` }}
      />

      <div className="lp-hero-inner">
        <div className="lp-hero-eyebrow">
          <span className="lp-eyebrow-dot" />
          Agent Execution Infrastructure
        </div>

        <h1 className="lp-hero-headline">
          {lines.map((line, i) => (
            <span
              key={i}
              className={`lp-hero-line ${revealed ? "lp-hero-line--visible" : ""}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {i === 0 ? (
                <>The <span className="lp-gradient-text">execution layer</span></>
              ) : (
                line
              )}
            </span>
          ))}
        </h1>

        <p className={`lp-hero-sub ${revealed ? "lp-hero-sub--visible" : ""}`}>
          Policy before every action. Exactly-once execution guarantee. SHA-256 receipt on every outcome.
        </p>

        {/* Pipeline */}
        <div className={`lp-pipeline ${revealed ? "lp-pipeline--visible" : ""}`}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <span className={`lp-pipeline-node ${s === "Execute \u00d71" ? "lp-pipeline-node--accent" : ""}`} style={{ animationDelay: `${i * 750}ms` }}>
                {s}
              </span>
              {i < steps.length - 1 && (
                <span className="lp-pipeline-arrow" style={{ animationDelay: `${i * 750 + 375}ms` }}>{"\u2192"}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTAs */}
        <div className="lp-hero-ctas">
          <a
            href="https://console.statis.dev/auth?mode=signup"
            className="lp-btn-primary lp-btn-lg"
            ref={mag1.ref}
            onMouseMove={mag1.onMouseMove}
            onMouseLeave={mag1.onMouseLeave}
          >
            Get Started Free
          </a>
          <a href="https://docs.statis.dev" className="lp-btn-ghost" target="_blank" rel="noopener noreferrer">
            Read the docs {"\u2192"}
          </a>
        </div>

        <div className="lp-pip-install">
          <span style={{ color: "#A1A1AA" }}>$</span> pip install statis-ai
          <button className="lp-copy-btn" onClick={() => navigator.clipboard?.writeText("pip install statis-ai")} aria-label="Copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>

        <p className="lp-trust-line">Free to start &middot; No credit card required &middot; Self-hostable</p>
      </div>
    </section>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function IntegrationsMarquee() {
  const [ref, visible] = useInView();
  const row1 = [...ROW_ONE, ...ROW_ONE, ...ROW_ONE];
  const row2 = [...ROW_TWO, ...ROW_TWO, ...ROW_TWO];

  return (
    <section className="lp-integrations" ref={ref}>
      <p className="lp-integrations-label">Works with your entire stack</p>
      <div className="lp-marquee-wrapper">
        <div className="lp-marquee-row lp-marquee-left">
          {row1.map((chip, i) => (
            <div key={`r1-${i}`} className="lp-chip" style={{ border: `1px solid rgba(${hexToRgb(chip.color)}, 0.22)` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={chip.color}><path d={chip.path} /></svg>
              <span>{chip.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-marquee-wrapper" style={{ marginTop: "12px" }}>
        <div className="lp-marquee-row lp-marquee-right">
          {row2.map((chip, i) => (
            <div key={`r2-${i}`} className="lp-chip" style={{ border: `1px solid rgba(${hexToRgb(chip.color)}, 0.22)` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={chip.color}><path d={chip.path} /></svg>
              <span>{chip.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const [ref, visible] = useInView({ threshold: 0.1 });

  return (
    <section className="lp-problem" ref={ref}>
      <div className="lp-container">
        <div className="lp-problem-grid">
          {/* Left: Error terminal */}
          <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`}>
            <div className="lp-terminal">
              <div className="lp-terminal-chrome">
                <div className="lp-terminal-dots">
                  <span style={{ background: "#5C2020" }} />
                  <span style={{ background: "#3F3520" }} />
                  <span style={{ background: "#2A2A2E" }} />
                </div>
                <span className="lp-terminal-title">agent.log — prod-worker-3</span>
                <span className="lp-terminal-error-badge">ERROR</span>
              </div>
              <div className="lp-terminal-prompt">
                <span style={{ color: "#52525B" }}>prod-worker-3@statis:~$ </span>
                <span style={{ color: "#A1A1AA" }}>tail -f agent.log</span>
              </div>
              <div className="lp-terminal-body">
                {ERROR_LINES.map(({ ts, key, val, warn, muted }) => (
                  <div key={key} className="lp-terminal-line">
                    <span style={{ color: "#52525B" }}>[{ts}]</span>
                    <span style={{ color: "#71717A", minWidth: "88px", display: "inline-block" }}>{key}</span>
                    <span style={{ color: warn ? "#EF4444" : muted ? "#52525B" : "#D4D4D8", fontWeight: warn ? 600 : 400 }}>{val}</span>
                  </div>
                ))}
                <div className="lp-terminal-warn">
                  <span style={{ color: "#71717A" }}>[09:23:12.001] </span>
                  <span style={{ color: "#EF4444" }}>WARN </span>
                  <span style={{ color: "#A1A1AA" }}>customer support ticket #4821 opened</span>
                </div>
                <div className="lp-terminal-cursor-line">
                  <span style={{ color: "#EF4444" }}>prod-worker-3@statis:~$ </span>
                  <span className="lp-blink-cursor" style={{ background: "#EF4444" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`} style={{ transitionDelay: "150ms" }}>
            <div className="lp-eyebrow-pill">The problem</div>
            <h2 className="lp-section-headline">Agents in production need a guardrail layer.</h2>
            <p className="lp-body-text">
              Your agent just charged a customer twice. There&rsquo;s no receipt, no audit trail, no way to know which policies ran or why. You find out when support calls.
            </p>
            <p className="lp-body-text">
              Every AI agent that touches production systems &mdash; billing, CRM, communication, data &mdash; needs policy evaluation before it acts and a tamper-evident record of what happened after.
            </p>
            <div className="lp-problem-pairs">
              {PROBLEMS.map(({ problem, fix }) => (
                <div key={problem} className="lp-problem-pair">
                  <div className="lp-problem-bad"><span>{"\u2717"}</span> {problem}</div>
                  <div className="lp-problem-good"><span>{"\u2713"}</span> {fix}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsolePreviewSection() {
  const [ref, visible] = useInView({ threshold: 0.1 });
  const tilt = useCardTilt();

  const m0 = useCountUp(METRICS[0].value, 2000, visible);
  const m1 = useCountUp(METRICS[1].value, 2000, visible, true);
  const m2 = useCountUp(METRICS[2].value, 2000, visible);
  const m3 = useCountUp(METRICS[3].value, 2000, visible, false, "M");
  const metricDisplays = [m0, m1, m2, m3];

  return (
    <section className="lp-console-section" ref={ref}>
      <div className="lp-container" style={{ textAlign: "center" }}>
        <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`}>
          <div className="lp-eyebrow-pill" style={{ margin: "0 auto 20px" }}>Console</div>
          <h2 className="lp-section-headline" style={{ textAlign: "center" }}>See everything. Control everything.</h2>
          <p className="lp-body-text" style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto 48px" }}>
            Every agent action observable, every policy decision auditable, every connector under one roof.
          </p>
        </div>

        <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`} style={{ transitionDelay: "150ms" }}>
          <div style={{ perspective: "2400px", perspectiveOrigin: "50% 30%" }}>
            <div
              className="lp-console-window"
              ref={tilt.ref}
              onMouseMove={tilt.onMouseMove}
              onMouseLeave={tilt.onMouseLeave}
            >
              {/* Chrome bar */}
              <div className="lp-console-chrome">
                <div className="lp-terminal-dots">
                  <span style={{ background: "#3F3F46" }} />
                  <span style={{ background: "#3F3F46" }} />
                  <span style={{ background: "#3F3F46" }} />
                </div>
                <div className="lp-console-url">console.statis.dev</div>
                <div style={{ width: 48 }} />
              </div>

              <div className="lp-console-layout">
                {/* Sidebar */}
                <div className="lp-console-sidebar">
                  <div className="lp-console-sidebar-logo">
                    <div className="lp-console-avatar">S</div>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>statis</span>
                  </div>
                  {SIDEBAR_ITEMS.map((section, si) => (
                    <div key={si} className="lp-sidebar-group">
                      {section.group && <p className="lp-sidebar-label">{section.group}</p>}
                      {section.items.map(item => (
                        <div key={item.name} className={`lp-sidebar-item ${item.active ? "lp-sidebar-item--active" : ""}`}>
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className={`lp-sidebar-badge ${item.name === "Escalations" ? "lp-sidebar-badge--warn" : ""}`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="lp-console-main">
                  <div className="lp-console-topbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>Home</span>
                      <span className="lp-console-badge-muted">Last 24h</span>
                    </div>
                    <div className="lp-console-live">
                      <span className="lp-live-dot" /> Live
                    </div>
                  </div>

                  <div className="lp-console-content">
                    {/* Metrics */}
                    <div className="lp-metrics-grid">
                      {METRICS.map((m, i) => (
                        <div key={m.label} className="lp-metric-card">
                          <p className="lp-metric-label">{m.label}</p>
                          <p className="lp-metric-value" style={{ color: i === 1 ? "#34D399" : "#FFFFFF" }}>
                            {metricDisplays[i]}
                          </p>
                          <p className="lp-metric-sub">{m.sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Filters */}
                    <div className="lp-filters">
                      {FILTERS.map(f => (
                        <button key={f.name} className={`lp-filter ${f.active ? "lp-filter--active" : ""}`}>
                          {f.name} <span className="lp-filter-count">{f.count}</span>
                        </button>
                      ))}
                    </div>

                    {/* Table */}
                    <div className="lp-action-table">
                      <div className="lp-table-header">
                        <span>Recent Actions</span>
                        <span style={{ color: "#52525B" }}>{"\u21bb"} auto-refresh</span>
                      </div>
                      <table>
                        <thead>
                          <tr>
                            {["ID", "Service", "Action", "Status", "Policy", "Time"].map(h => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ACTIONS_DATA.map((a, idx) => {
                            const sc = STATUS_COLORS[a.status];
                            return (
                              <tr key={a.id} className={a.selected ? "lp-row--selected" : ""}>
                                <td style={{ color: "#A1A1AA" }}>{a.id}</td>
                                <td>
                                  <span className="lp-entity-dot" style={{ background: a.entityColor }} />
                                  <span style={{ color: "#E4E4E7" }}>{a.entity}</span>
                                </td>
                                <td style={{ color: "#FFFFFF" }}>{a.action}</td>
                                <td>
                                  <span className="lp-status-pill" style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                                    <span className="lp-status-dot" style={{ background: sc.color }} />
                                    {a.status}
                                  </span>
                                </td>
                                <td className="lp-hide-mobile" style={{ color: "#71717A" }}>{a.rule}</td>
                                <td style={{ color: "#71717A", textAlign: "right" }}>{a.time}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeSnippetSection() {
  const [ref, visible] = useInView();
  const [visibleLines, setVisibleLines] = useState(0);
  const tilt = useCardTilt();

  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleLines(CODE_TOKENS.length);
      return;
    }
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= CODE_TOKENS.length) clearInterval(timer);
    }, 120);
    return () => clearInterval(timer);
  }, [visible]);

  const steps = [
    { step: "01", label: "pip install statis-ai" },
    { step: "02", label: "Set STATIS_API_KEY" },
    { step: "03", label: "propose \u2192 execute" },
  ];

  return (
    <section className="lp-code-section" ref={ref}>
      <div className="lp-container">
        <div className="lp-code-grid">
          <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`}>
            <div className="lp-eyebrow-pill">SDK</div>
            <h2 className="lp-section-headline">Three lines to governed execution.</h2>
            <p className="lp-body-text">
              Propose an action. The policy engine evaluates it against your rules. Execute with an exactly-once guarantee. Every outcome gets a tamper-evident receipt.
            </p>
            <div className="lp-steps">
              {steps.map(({ step, label }) => (
                <div key={step} className="lp-step">
                  <span className="lp-step-num">{step}</span>
                  <span className="lp-step-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`} style={{ transitionDelay: "100ms" }}>
            <div
              className="lp-code-editor"
              ref={tilt.ref}
              onMouseMove={tilt.onMouseMove}
              onMouseLeave={tilt.onMouseLeave}
            >
              <div className="lp-code-chrome">
                <div className="lp-terminal-dots">
                  <span style={{ background: "#5C2020" }} />
                  <span style={{ background: "#5C5020" }} />
                  <span style={{ background: "#205C20" }} />
                </div>
                <span className="lp-terminal-title">agent.py — python3</span>
              </div>
              <div className="lp-code-prompt">
                <span style={{ color: "#71717A" }}>~/projects/my-agent </span>
                <span style={{ color: "#E8813A" }}>{"\u276f"} </span>
                <span style={{ color: "#A1A1AA" }}>python3 agent.py</span>
              </div>
              <pre className="lp-code-body">
                <div className="lp-line-numbers">
                  {CODE_TOKENS.map((_, li) => <div key={li}>{li + 1}</div>)}
                </div>
                <div className="lp-code-lines">
                  {CODE_TOKENS.map((tokens, li) => (
                    <div key={li} className="lp-code-line" style={{ opacity: li < visibleLines ? 1 : 0, transition: "opacity 0.3s ease" }}>
                      {tokens.length === 0 ? "\u00A0" : tokens.map((tok, ti) => (
                        <span key={ti} style={{ color: tok.c }}>{tok.t}</span>
                      ))}
                    </div>
                  ))}
                  <div className="lp-code-cursor-line">
                    <span style={{ color: "#E8813A" }}>{"\u276f"} </span>
                    <span className="lp-blink-cursor" style={{ background: "#E8813A" }} />
                  </div>
                </div>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MethodSection() {
  const [ref, visible] = useInView();

  return (
    <section id="method" className="lp-method" ref={ref}>
      <div className="lp-container">
        <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`} style={{ textAlign: "center", marginBottom: "80px" }}>
          <div className="lp-eyebrow-pill" style={{ margin: "0 auto 24px" }}>Method</div>
          <h2 className="lp-section-headline" style={{ textAlign: "center" }}>
            How we think about <span className="lp-gradient-text">governed execution.</span>
          </h2>
          <p className="lp-body-text" style={{ textAlign: "center", maxWidth: "560px", margin: "20px auto 0" }}>
            Five principles that shape every decision in the Statis codebase. These aren&apos;t marketing &mdash; they&apos;re the trade-offs we refuse to make.
          </p>
        </div>

        <div className="lp-principles">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.num}
              className={`lp-principle lp-reveal ${visible ? "lp-reveal--visible" : ""}`}
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="lp-principle-grid">
                <span className="lp-principle-num">{p.num}</span>
                <h3 className="lp-principle-title">{p.title}</h3>
                <p className="lp-principle-desc">{p.desc}</p>
              </div>
            </div>
          ))}
          <div className="lp-principle-border" />
        </div>
      </div>
    </section>
  );
}

function ManifestoSection() {
  const [ref, visible] = useInView();

  return (
    <section className="lp-manifesto" ref={ref}>
      <div className="lp-manifesto-glow" />
      <div className="lp-manifesto-line-top" />
      <div className="lp-manifesto-line-bottom" />
      <div className="lp-container" style={{ textAlign: "center", position: "relative" }}>
        <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`}>
          <div className="lp-eyebrow-pill" style={{ margin: "0 auto 40px" }}>The Statis Manifesto</div>
          <h2 className="lp-manifesto-headline">
            Agents need<br />
            <span className="lp-gradient-text">infrastructure,</span><br />
            not guardrails.
          </h2>
          <p className="lp-body-text" style={{ textAlign: "center", maxWidth: "640px", margin: "40px auto 0", fontSize: "17px" }}>
            Every action flows through a deterministic trust layer. Every outcome is receipted. Every decision is reversible, auditable, and reproducible. That&apos;s the product.
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [ref, visible] = useInView();

  return (
    <section id="faq" className="lp-faq" ref={ref}>
      <div className="lp-container" style={{ maxWidth: "720px" }}>
        <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`} style={{ textAlign: "center", marginBottom: "48px" }}>
          <div className="lp-eyebrow-pill" style={{ margin: "0 auto 20px" }}>Questions</div>
          <h2 className="lp-section-headline" style={{ textAlign: "center" }}>Frequently asked.</h2>
        </div>

        <div className="lp-faq-list">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`lp-faq-item lp-reveal ${visible ? "lp-reveal--visible" : ""} ${isOpen ? "lp-faq-item--open" : ""}`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="lp-faq-trigger"
                >
                  <span>{faq.q}</span>
                  <span className={`lp-faq-icon ${isOpen ? "lp-faq-icon--open" : ""}`}>+</span>
                </button>
                <div className={`lp-faq-answer ${isOpen ? "lp-faq-answer--open" : ""}`}>
                  <div className="lp-faq-answer-inner">{faq.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EnterpriseSection() {
  const [ref, visible] = useInView();

  return (
    <section className="lp-enterprise" ref={ref}>
      <div className="lp-container">
        <div className={`lp-reveal ${visible ? "lp-reveal--visible" : ""}`} style={{ textAlign: "center", marginBottom: "48px" }}>
          <div className="lp-eyebrow-pill" style={{ margin: "0 auto 20px" }}>Built for production</div>
          <h2 className="lp-section-headline" style={{ textAlign: "center" }}>Enterprise-ready from day one.</h2>
          <p className="lp-body-text" style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
            The controls your security team will ask for before procurement &mdash; already built in.
          </p>
        </div>

        <div className="lp-enterprise-grid">
          {ENTERPRISE_BADGES.map((badge, i) => {
            const tilt = useCardTilt();
            return (
              <div
                key={badge.title}
                className={`lp-enterprise-card lp-reveal ${visible ? "lp-reveal--visible" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
                ref={tilt.ref}
                onMouseMove={tilt.onMouseMove}
                onMouseLeave={tilt.onMouseLeave}
              >
                <div className="lp-enterprise-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    className={`lp-svg-icon ${visible ? "lp-svg-icon--visible" : ""}`}
                    style={{ animationDelay: `${i * 100 + 300}ms` }}
                  >
                    <path d={badge.icon} />
                  </svg>
                </div>
                <div>
                  <p className="lp-enterprise-title">{badge.title}</p>
                  <p className="lp-enterprise-sub">{badge.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [ref, visible] = useInView();
  const mag = useMagnetic();

  return (
    <section className="lp-cta-section" ref={ref}>
      <div className="lp-container">
        <div className={`lp-cta-card lp-reveal ${visible ? "lp-reveal--visible" : ""}`}>
          <div className="lp-cta-glow" />
          <div className="lp-cta-grid">
            {/* Left: Receipt */}
            <div className="lp-cta-left">
              <div className="lp-cta-receipt">
                <div><span style={{ color: "#71717A" }}>receipt_id</span>  <span style={{ color: "#A1A1AA" }}>sha256:a3f29c...</span></div>
                <div><span style={{ color: "#71717A" }}>action    </span>  <span style={{ color: "#E8813A" }}>deploy_landing_page</span></div>
                <div><span style={{ color: "#71717A" }}>status    </span>  <span style={{ color: "#34D399" }}>COMPLETED</span></div>
                <div><span style={{ color: "#71717A" }}>policy    </span>  <span style={{ color: "#D4D4D8" }}>infra_deploy_v1</span></div>
              </div>
              <p className="lp-cta-dogfood-title">We used Statis to build Statis.</p>
              <p className="lp-cta-dogfood-sub">Every action on this site ran through our own infrastructure.</p>
            </div>

            {/* Right: CTA */}
            <div className="lp-cta-right">
              <div className="lp-eyebrow-pill" style={{ margin: "0 auto 24px" }}>Get started</div>
              <h2 className="lp-section-headline" style={{ textAlign: "center" }}>
                Ship your first governed action in 5 minutes.
              </h2>
              <p className="lp-body-text" style={{ textAlign: "center", maxWidth: "360px", margin: "0 auto 32px" }}>
                Free to start. No credit card required. Scales to millions of actions.
              </p>
              <div className="lp-hero-ctas" style={{ justifyContent: "center" }}>
                <a
                  href="https://console.statis.dev/auth?mode=signup"
                  className="lp-btn-primary lp-btn-lg"
                  ref={mag.ref}
                  onMouseMove={mag.onMouseMove}
                  onMouseLeave={mag.onMouseLeave}
                >
                  Start for free
                </a>
                <a href="https://docs.statis.dev" className="lp-btn-ghost" target="_blank" rel="noopener noreferrer">
                  Read the docs {"\u2192"}
                </a>
              </div>
              <p className="lp-trust-line" style={{ marginTop: "32px" }}>pip install statis-ai</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <span className="lp-logo" style={{ fontSize: "24px" }}>statis<span className="lp-logo-dot">.</span></span>
            <p className="lp-footer-tagline">
              Agent execution infrastructure. Policy before every action. Exactly-once execution guarantee. SHA-256 tamper-evident receipt on every outcome.
            </p>
            <a href="https://status.statis.dev" target="_blank" rel="noopener noreferrer" className="lp-status-pill">
              <span className="lp-status-green-dot" /> All systems operational
            </a>
          </div>
          <div className="lp-footer-newsletter">
            <p className="lp-footer-section-label">Stay updated</p>
            <p className="lp-footer-newsletter-desc">Monthly updates on agent infrastructure and governance. No spam, unsubscribe anytime.</p>
            <form className="lp-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@company.com" className="lp-newsletter-input" />
              <button type="submit" className="lp-newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="lp-footer-links">
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="lp-footer-section-label">{group}</h3>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lp-footer-bottom">
          <div className="lp-footer-legal">
            <span>&copy; 2026 Statis Inc.</span>
            <span className="lp-hide-sm">Made in San Francisco</span>
          </div>
          <div className="lp-footer-social">
            <a href="https://github.com/statis-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <a href="https://x.com/statis_ai" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com/company/statis-ai" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="lp-footer-wordmark" aria-hidden="true">statis</div>
    </footer>
  );
}

/* ==========================================================================
   4. MAIN COMPONENT
   ========================================================================== */

export default function LandingPage() {
  return (
    <div className="lp-root">
      <LandingStyles />
      <ScrollProgressBar />
      {/* SVG noise filter */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="lp-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div className="lp-noise-overlay" />

      <NavBar />
      <main>
        <HeroSection />
        <IntegrationsMarquee />
        <ProblemSection />
        <ConsolePreviewSection />
        <CodeSnippetSection />
        <MethodSection />
        <ManifestoSection />
        <FAQSection />
        <EnterpriseSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}

/* ==========================================================================
   5. STYLES
   ========================================================================== */

function LandingStyles() {
  return (
    <style>{`
      @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap');
      @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap');

      /* ========== ROOT ========== */
      .lp-root {
        font-family: 'General Sans', system-ui, -apple-system, sans-serif;
        background: #FAFAF8;
        color: #1A1A1A;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
        position: relative;
      }
      .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }
      .lp-root ::selection { background: rgba(255,107,0,0.15); }

      .lp-noise-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.03;
        filter: url(#lp-noise);
        width: 100%;
        height: 100%;
      }

      /* ========== PROGRESS BAR ========== */
      .lp-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: #FF6B00;
        z-index: 10000;
        transition: width 0.1s linear;
      }

      /* ========== TYPOGRAPHY ========== */
      .lp-section-headline {
        font-family: 'Satoshi', sans-serif;
        font-weight: 800;
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        line-height: 1.1;
        letter-spacing: -0.03em;
        color: #1A1A1A;
        margin: 0 0 16px;
      }
      .lp-body-text {
        font-size: 16px;
        line-height: 1.6;
        color: #4A4A4A;
        margin: 0 0 20px;
      }
      .lp-gradient-text {
        background: linear-gradient(135deg, #EA580C 0%, #FF6B00 55%, #FF9A4D 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .lp-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      /* ========== EYEBROW ========== */
      .lp-eyebrow-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #FF6B00;
        padding: 6px 14px;
        border-radius: 100px;
        border: 1px solid rgba(255,107,0,0.2);
        background: rgba(255,107,0,0.05);
        margin-bottom: 20px;
        width: fit-content;
      }
      .lp-eyebrow-pill::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #FF6B00;
      }

      /* ========== REVEAL ========== */
      .lp-reveal {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
      }
      .lp-reveal--visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* ========== BUTTONS ========== */
      .lp-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 24px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 600;
        font-family: monospace;
        background: #FF6B00;
        color: #fff;
        text-decoration: none;
        border: none;
        cursor: pointer;
        transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        will-change: transform;
      }
      .lp-btn-primary:hover {
        box-shadow: 0 0 30px rgba(255,107,0,0.3), 0 4px 16px rgba(255,107,0,0.2);
      }
      .lp-btn-lg { padding: 12px 28px; }
      .lp-btn-ghost {
        display: inline-flex;
        align-items: center;
        padding: 12px 24px;
        border-radius: 100px;
        font-size: 14px;
        font-weight: 500;
        color: #4A4A4A;
        text-decoration: none;
        border: 1px solid rgba(0,0,0,0.1);
        background: transparent;
        transition: color 0.2s, border-color 0.2s;
      }
      .lp-btn-ghost:hover { color: #1A1A1A; border-color: rgba(0,0,0,0.2); }

      /* ========== NAV ========== */
      .lp-nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        transition: background 0.3s, backdrop-filter 0.3s, padding 0.3s;
        background: rgba(250,250,248,0.4);
      }
      .lp-nav--scrolled {
        background: rgba(250,250,248,0.85);
        backdrop-filter: blur(12px) saturate(120%);
        -webkit-backdrop-filter: blur(12px) saturate(120%);
        border-bottom: 1px solid rgba(0,0,0,0.06);
      }
      .lp-nav-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        transition: padding 0.3s;
      }
      .lp-nav--scrolled .lp-nav-inner { padding: 14px 24px; }
      .lp-logo {
        font-family: 'Satoshi', sans-serif;
        font-weight: 900;
        font-size: 20px;
        color: #1A1A1A;
        text-decoration: none;
        letter-spacing: -0.02em;
      }
      .lp-logo-dot { color: #FF6B00; }
      .lp-nav-links {
        display: flex;
        align-items: center;
        gap: 32px;
      }
      .lp-nav-links a {
        font-size: 14px;
        color: #4A4A4A;
        text-decoration: none;
        transition: color 0.15s;
      }
      .lp-nav-links a:hover { color: #1A1A1A; }
      .lp-nav-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .lp-nav-login {
        font-size: 14px;
        color: #4A4A4A;
        text-decoration: none;
        transition: color 0.15s;
      }
      .lp-nav-login:hover { color: #1A1A1A; }
      .lp-mobile-toggle { display: none; }

      /* ========== HERO ========== */
      .lp-hero {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 120px 24px 80px;
        overflow: hidden;
      }
      .lp-hero-gradient-mesh {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse 60% 50% at 30% 40%, rgba(255,107,0,0.08) 0%, transparent 70%),
          radial-gradient(ellipse 50% 60% at 70% 60%, rgba(255,154,77,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 50% 20%, rgba(255,212,170,0.05) 0%, transparent 70%);
        animation: lp-mesh-drift 15s ease-in-out infinite alternate;
        pointer-events: none;
      }
      @keyframes lp-mesh-drift {
        0% { transform: scale(1) translate(0,0); }
        100% { transform: scale(1.1) translate(-2%,3%); }
      }
      .lp-dot-grid {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
        background-size: 30px 30px;
        pointer-events: none;
        mask-image: radial-gradient(circle 120px at var(--dot-x, -200px) var(--dot-y, -200px), rgba(0,0,0,0.4) 0%, transparent 100%);
        -webkit-mask-image: radial-gradient(circle 120px at var(--dot-x, -200px) var(--dot-y, -200px), rgba(0,0,0,0.4) 0%, transparent 100%);
      }
      .lp-hero-inner {
        position: relative;
        z-index: 1;
        text-align: center;
        max-width: 800px;
      }
      .lp-hero-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #FF6B00;
        padding: 6px 14px;
        border-radius: 100px;
        border: 1px solid rgba(255,107,0,0.2);
        background: rgba(255,107,0,0.05);
        margin-bottom: 32px;
      }
      .lp-eyebrow-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #FF6B00;
      }
      .lp-hero-headline {
        font-family: 'Satoshi', sans-serif;
        font-weight: 900;
        font-size: clamp(2.5rem, 5.5vw, 4.5rem);
        line-height: 1.05;
        letter-spacing: -0.03em;
        margin: 0 0 24px;
        color: #1A1A1A;
      }
      .lp-hero-line {
        display: block;
        clip-path: inset(100% 0 0 0);
        animation: lp-clip-reveal 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
        animation-play-state: paused;
      }
      .lp-hero-line--visible { animation-play-state: running; }
      @keyframes lp-clip-reveal {
        0% { clip-path: inset(100% 0 0 0); }
        100% { clip-path: inset(0 0 0 0); }
      }
      .lp-hero-sub {
        font-size: 17px;
        line-height: 1.6;
        color: #4A4A4A;
        max-width: 540px;
        margin: 0 auto 28px;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.6s 0.8s ease, transform 0.6s 0.8s ease;
      }
      .lp-hero-sub--visible { opacity: 1; transform: translateY(0); }

      /* Pipeline */
      .lp-pipeline {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: monospace;
        font-size: 13px;
        color: #A1A1AA;
        margin-bottom: 40px;
        opacity: 0;
        transition: opacity 0.6s 1s ease;
      }
      .lp-pipeline--visible { opacity: 1; }
      .lp-pipeline-node {
        padding: 4px 10px;
        border-radius: 4px;
        animation: lp-node-pulse 3s ease-in-out infinite;
      }
      .lp-pipeline-node--accent { color: #FF6B00; }
      @keyframes lp-node-pulse {
        0%, 100% { background: transparent; }
        50% { background: rgba(255,107,0,0.08); }
      }
      .lp-pipeline-arrow {
        color: rgba(255,107,0,0.3);
        animation: lp-arrow-flow 3s ease-in-out infinite;
      }
      @keyframes lp-arrow-flow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; color: #FF6B00; }
      }

      .lp-hero-ctas {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .lp-pip-install {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: monospace;
        font-size: 13px;
        color: #1A1A1A;
        padding: 8px 16px;
        border-radius: 8px;
        background: rgba(0,0,0,0.03);
        border: 1px solid rgba(0,0,0,0.06);
        margin-bottom: 16px;
      }
      .lp-copy-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: #A1A1AA;
        padding: 2px;
        display: flex;
        transition: color 0.2s;
      }
      .lp-copy-btn:hover { color: #FF6B00; }
      .lp-trust-line {
        font-size: 11px;
        color: #A1A1AA;
        font-family: monospace;
      }

      /* ========== INTEGRATIONS MARQUEE ========== */
      .lp-integrations {
        padding: 40px 0;
        border-top: 1px solid rgba(0,0,0,0.06);
        border-bottom: 1px solid rgba(0,0,0,0.06);
        overflow: hidden;
      }
      .lp-integrations-label {
        text-align: center;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.25em;
        color: #A1A1AA;
        margin-bottom: 28px;
      }
      .lp-marquee-wrapper {
        position: relative;
        overflow: hidden;
        mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
        -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
      }
      .lp-marquee-row {
        display: flex;
        gap: 12px;
        width: max-content;
      }
      .lp-marquee-left { animation: lp-marquee-l 32s linear infinite; }
      .lp-marquee-right { animation: lp-marquee-r 28s linear infinite; }
      .lp-marquee-wrapper:hover .lp-marquee-row { animation-play-state: paused; }
      @keyframes lp-marquee-l {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
      @keyframes lp-marquee-r {
        0% { transform: translateX(-33.333%); }
        100% { transform: translateX(0); }
      }
      .lp-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(0,0,0,0.02);
        white-space: nowrap;
        flex-shrink: 0;
      }
      .lp-chip span { font-size: 12px; font-weight: 500; color: #52525B; }

      /* ========== PROBLEM ========== */
      .lp-problem { padding: 120px 0; }
      .lp-problem-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 64px;
        align-items: center;
      }

      /* ========== TERMINAL ========== */
      .lp-terminal {
        border-radius: 12px;
        overflow: hidden;
        background: #0C0C0F;
        border: 1px solid rgba(255,255,255,0.08);
        border-top: 1px solid rgba(220,60,60,0.35);
        box-shadow: 0 32px 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .lp-terminal-chrome {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #111114;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .lp-terminal-dots {
        display: flex;
        gap: 6px;
      }
      .lp-terminal-dots span { width: 10px; height: 10px; border-radius: 50%; display: block; }
      .lp-terminal-title {
        flex: 1;
        text-align: center;
        font-family: monospace;
        font-size: 10px;
        color: #71717A;
      }
      .lp-terminal-error-badge {
        font-family: monospace;
        font-size: 9px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(220,60,60,0.12);
        color: #EF4444;
        border: 1px solid rgba(220,60,60,0.25);
      }
      .lp-terminal-prompt {
        padding: 12px 16px 8px;
        font-family: monospace;
        font-size: 11px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .lp-terminal-body {
        padding: 16px;
        font-family: monospace;
        font-size: 12px;
        line-height: 1.9;
      }
      .lp-terminal-line {
        display: flex;
        gap: 12px;
      }
      .lp-terminal-warn { margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
      .lp-terminal-cursor-line { margin-top: 8px; }
      .lp-blink-cursor {
        display: inline-block;
        width: 7px;
        height: 13px;
        vertical-align: middle;
        animation: lp-blink 1s step-start infinite;
      }
      @keyframes lp-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      .lp-problem-pairs { display: flex; flex-direction: column; gap: 12px; margin-top: 32px; }
      .lp-problem-pair { display: flex; gap: 16px; font-size: 13px; }
      .lp-problem-bad { flex: 1; color: #A1A1AA; }
      .lp-problem-bad span { color: #71717A; }
      .lp-problem-good { flex: 1; color: #FF6B00; }

      /* ========== CONSOLE PREVIEW ========== */
      .lp-console-section {
        padding: 80px 0 160px;
        background: linear-gradient(180deg, #FAFAF8 0%, #F0F0EE 20%, #E0E0DD 50%, #C8C8C5 80%, #A0A09D 100%);
        overflow: hidden;
      }
      .lp-console-window {
        border-radius: 16px;
        overflow: hidden;
        background: #0F0F12;
        border: 1px solid rgba(255,255,255,0.08);
        text-align: left;
        transform: rotateX(3deg);
        transform-origin: 50% 100%;
        transition: transform 0.4s ease-out;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 80px 160px rgba(0,0,0,0.20), 0 30px 60px rgba(0,0,0,0.15), 0 6px 16px rgba(0,0,0,0.12);
      }
      .lp-console-chrome {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #15151A;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .lp-console-url {
        flex: 1;
        text-align: center;
        font-family: monospace;
        font-size: 11px;
        color: #A1A1AA;
        padding: 4px 12px;
        border-radius: 6px;
        background: #0B0B0E;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .lp-console-layout { display: flex; }
      .lp-console-sidebar {
        width: 200px;
        background: #0B0B0E;
        border-right: 1px solid rgba(255,255,255,0.06);
        padding: 20px 0;
        flex-shrink: 0;
      }
      .lp-console-sidebar-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 20px;
        margin-bottom: 28px;
      }
      .lp-console-avatar {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        background: linear-gradient(135deg, #FF6B00, #c85c1a);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: #fff;
      }
      .lp-sidebar-group { margin-bottom: 20px; padding: 0 10px; }
      .lp-sidebar-label {
        font-family: monospace;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #52525B;
        padding: 0 10px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .lp-sidebar-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        color: #A1A1AA;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        margin-bottom: 2px;
      }
      .lp-sidebar-item:hover { background: rgba(255,255,255,0.04); color: #fff; }
      .lp-sidebar-item--active {
        background: rgba(255,255,255,0.06);
        color: #fff;
        font-weight: 600;
        box-shadow: inset 2px 0 0 rgba(255,255,255,0.6);
      }
      .lp-sidebar-badge {
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 100px;
        font-weight: 600;
        background: rgba(255,255,255,0.06);
        color: #A1A1AA;
        border: 1px solid rgba(255,255,255,0.08);
      }
      .lp-sidebar-badge--warn {
        background: rgba(250,204,21,0.12);
        color: #FACC15;
        border-color: rgba(250,204,21,0.28);
      }
      .lp-console-main {
        flex: 1;
        min-height: 480px;
        display: flex;
        flex-direction: column;
        background: #0F0F12;
      }
      .lp-console-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .lp-console-badge-muted {
        font-family: monospace;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(255,255,255,0.05);
        color: #71717A;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .lp-console-live {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 4px;
        background: rgba(16,185,129,0.10);
        border: 1px solid rgba(16,185,129,0.28);
        color: #10B981;
      }
      .lp-live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10B981;
        animation: lp-pulse 1.6s ease-in-out infinite;
      }
      @keyframes lp-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
        50% { box-shadow: 0 0 0 4px rgba(16,185,129,0); }
      }
      .lp-console-content { flex: 1; padding: 24px; }
      .lp-metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 24px;
      }
      .lp-metric-card {
        padding: 14px;
        border-radius: 8px;
        background: #15151A;
        border: 1px solid rgba(255,255,255,0.06);
        transition: background 0.15s;
      }
      .lp-metric-card:hover { background: #1A1A20; }
      .lp-metric-label {
        font-family: monospace;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #71717A;
        margin-bottom: 6px;
        font-weight: 600;
      }
      .lp-metric-value { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
      .lp-metric-sub { font-size: 10px; color: #52525B; margin-top: 4px; }
      .lp-filters { display: flex; gap: 6px; margin-bottom: 12px; }
      .lp-filter {
        font-size: 10px;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        color: #A1A1AA;
        background: transparent;
        border: 1px solid transparent;
        transition: background 0.15s, color 0.15s;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .lp-filter:hover { background: rgba(255,255,255,0.05); color: #E4E4E7; }
      .lp-filter--active { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.10); }
      .lp-filter-count { font-size: 9px; color: #52525B; font-weight: 500; }
      .lp-filter--active .lp-filter-count { color: #A1A1AA; }
      .lp-action-table {
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.06);
        overflow: hidden;
      }
      .lp-table-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        background: #15151A;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        font-family: monospace;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #A1A1AA;
      }
      .lp-action-table table { width: 100%; border-collapse: collapse; }
      .lp-action-table th {
        padding: 10px 12px;
        text-align: left;
        font-family: monospace;
        font-size: 10px;
        font-weight: 600;
        color: #71717A;
        letter-spacing: 0.06em;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .lp-action-table td {
        padding: 10px 12px;
        font-family: monospace;
        font-size: 11px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .lp-action-table tr:last-child td { border-bottom: none; }
      .lp-action-table tr:hover { background: rgba(255,255,255,0.03); }
      .lp-row--selected { background: rgba(255,255,255,0.04); box-shadow: inset 2px 0 0 rgba(255,255,255,0.5); }
      .lp-entity-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 6px; vertical-align: middle; }
      .lp-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 9px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 700;
      }
      .lp-status-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }

      /* ========== CODE SECTION ========== */
      .lp-code-section { padding: 120px 0; }
      .lp-code-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        align-items: center;
      }
      .lp-steps { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
      .lp-step { display: flex; align-items: center; gap: 16px; }
      .lp-step-num { font-family: monospace; font-size: 11px; font-weight: 700; color: #FF6B00; width: 24px; }
      .lp-step-label { font-family: monospace; font-size: 13px; color: #4A4A4A; }
      .lp-code-editor {
        border-radius: 12px;
        overflow: hidden;
        background: #0C0C0F;
        border: 1px solid rgba(255,255,255,0.08);
        border-top: 1px solid rgba(255,107,0,0.30);
        box-shadow: 0 32px 80px rgba(0,0,0,0.15), 0 0 60px rgba(255,107,0,0.04), inset 0 1px 0 rgba(255,255,255,0.05);
        transition: transform 0.4s ease-out;
      }
      .lp-code-chrome {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #111114;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .lp-code-prompt {
        padding: 12px 16px 4px;
        font-family: monospace;
        font-size: 11px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .lp-code-body {
        display: flex;
        font-family: monospace;
        font-size: 12px;
        line-height: 1.8;
        overflow-x: auto;
        margin: 0;
      }
      .lp-line-numbers {
        padding: 16px 12px;
        text-align: right;
        color: #3F3F46;
        user-select: none;
        border-right: 1px solid rgba(255,255,255,0.06);
        min-width: 40px;
      }
      .lp-code-lines { padding: 16px; flex: 1; }
      .lp-code-line { transition: opacity 0.3s ease; }
      .lp-code-cursor-line { margin-top: 4px; }

      /* ========== METHOD ========== */
      .lp-method { padding: 120px 0; position: relative; overflow: hidden; }
      .lp-principles { position: relative; }
      .lp-principle {
        padding: 32px 0;
        border-top: 1px solid rgba(0,0,0,0.06);
        transition: background 0.3s;
      }
      .lp-principle:hover { background: linear-gradient(90deg, transparent, rgba(255,107,0,0.03), transparent); }
      .lp-principle-grid {
        display: grid;
        grid-template-columns: 100px 1fr 1fr;
        gap: 40px;
        align-items: start;
      }
      .lp-principle-num { font-family: monospace; font-size: 12px; letter-spacing: 0.2em; color: #FF6B00; }
      .lp-principle-title {
        font-family: 'Satoshi', sans-serif;
        font-weight: 700;
        font-size: clamp(1.1rem, 2vw, 1.4rem);
        line-height: 1.2;
        letter-spacing: -0.015em;
        color: #1A1A1A;
      }
      .lp-principle-desc { font-size: 14px; line-height: 1.6; color: #4A4A4A; }
      .lp-principle-border { border-top: 1px solid rgba(0,0,0,0.06); }

      /* ========== MANIFESTO ========== */
      .lp-manifesto {
        position: relative;
        padding: 160px 0;
        overflow: hidden;
      }
      .lp-manifesto-glow {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,107,0,0.06) 0%, transparent 70%);
        pointer-events: none;
      }
      .lp-manifesto-line-top, .lp-manifesto-line-bottom {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255,107,0,0.25), transparent);
      }
      .lp-manifesto-line-top { top: 0; }
      .lp-manifesto-line-bottom { bottom: 0; }
      .lp-manifesto-headline {
        font-family: 'Satoshi', sans-serif;
        font-weight: 900;
        font-size: clamp(2.2rem, 5vw, 4rem);
        line-height: 1.02;
        letter-spacing: -0.03em;
        color: #1A1A1A;
        margin: 0;
      }

      /* ========== FAQ ========== */
      .lp-faq { padding: 120px 0; }
      .lp-faq-list { display: flex; flex-direction: column; gap: 8px; }
      .lp-faq-item {
        background: #F0F0EE;
        border: 1px solid rgba(0,0,0,0.06);
        border-radius: 6px;
        overflow: hidden;
        transition: border-color 0.2s;
      }
      .lp-faq-item--open {
        border-color: rgba(255,107,0,0.2);
        border-left: 2px solid rgba(255,107,0,0.4);
      }
      .lp-faq-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        font-size: 14px;
        font-weight: 500;
        color: #1A1A1A;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        gap: 16px;
        font-family: inherit;
      }
      .lp-faq-icon {
        color: #FF6B00;
        font-size: 18px;
        font-weight: 700;
        transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        flex-shrink: 0;
      }
      .lp-faq-icon--open { transform: rotate(45deg); }
      .lp-faq-answer {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: max-height 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
      }
      .lp-faq-answer--open { max-height: 300px; opacity: 1; }
      .lp-faq-answer-inner {
        padding: 0 20px 16px;
        font-size: 14px;
        line-height: 1.6;
        color: #4A4A4A;
        border-top: 1px solid rgba(0,0,0,0.06);
        padding-top: 16px;
      }

      /* ========== ENTERPRISE ========== */
      .lp-enterprise {
        padding: 80px 0;
        border-top: 1px solid rgba(0,0,0,0.06);
        background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255,107,0,0.04), transparent 70%);
      }
      .lp-enterprise-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      .lp-enterprise-card {
        display: flex;
        gap: 16px;
        padding: 20px;
        border-radius: 8px;
        background: #FAFAF8;
        border: 1px solid rgba(0,0,0,0.06);
        border-top: 1px solid rgba(255,107,0,0.20);
        transition: transform 0.4s ease-out, border-color 0.2s, box-shadow 0.2s;
      }
      .lp-enterprise-card:hover {
        border-color: rgba(255,107,0,0.20);
        box-shadow: 0 0 24px rgba(255,107,0,0.08);
      }
      .lp-enterprise-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: rgba(255,107,0,0.07);
        border: 1px solid rgba(255,107,0,0.12);
        color: #FF6B00;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .lp-enterprise-title { font-size: 13px; font-weight: 700; color: #1A1A1A; margin-bottom: 6px; }
      .lp-enterprise-sub { font-size: 12px; line-height: 1.5; color: #4A4A4A; }

      /* SVG stroke animation */
      .lp-svg-icon path {
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        transition: stroke-dashoffset 0.8s ease;
      }
      .lp-svg-icon--visible path {
        stroke-dashoffset: 0;
      }

      /* ========== CTA ========== */
      .lp-cta-section { padding: 120px 0; border-top: 1px solid rgba(0,0,0,0.06); }
      .lp-cta-card {
        border-radius: 12px;
        overflow: hidden;
        background: linear-gradient(135deg, #F0F0EE, #E8E8E5);
        border: 1px solid rgba(0,0,0,0.06);
        border-top: 1px solid rgba(255,107,0,0.30);
        box-shadow: 0 0 80px rgba(255,107,0,0.05), 0 32px 80px rgba(0,0,0,0.08);
        position: relative;
      }
      .lp-cta-glow {
        position: absolute;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        height: 200px;
        background: radial-gradient(ellipse, rgba(255,107,0,0.08), transparent 70%);
        pointer-events: none;
      }
      .lp-cta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
      }
      .lp-cta-left {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 56px 32px;
        border-right: 1px solid rgba(0,0,0,0.06);
      }
      .lp-cta-receipt {
        font-family: monospace;
        font-size: 10px;
        padding: 16px 20px;
        border-radius: 8px;
        background: #0C0C0F;
        border: 1px solid rgba(255,255,255,0.08);
        border-top: 1px solid rgba(255,107,0,0.25);
        color: #A1A1AA;
        line-height: 1.8;
        margin-bottom: 24px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .lp-cta-dogfood-title { font-size: 14px; font-weight: 600; color: #1A1A1A; }
      .lp-cta-dogfood-sub { font-size: 13px; color: #4A4A4A; margin-top: 8px; text-align: center; }
      .lp-cta-right {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 56px 32px;
        text-align: center;
      }

      /* ========== FOOTER ========== */
      .lp-footer {
        background: #09090B;
        color: #A1A1AA;
        border-top: 1px solid #27272A;
        overflow: hidden;
        position: relative;
      }
      .lp-footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 80px 24px 40px;
        position: relative;
        z-index: 1;
      }
      .lp-footer-top {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 48px;
        margin-bottom: 64px;
        padding-bottom: 56px;
        border-bottom: 1px solid #27272A;
      }
      .lp-footer-brand .lp-logo { color: #fff; font-size: 24px; }
      .lp-footer-tagline { font-size: 13px; color: #71717A; line-height: 1.6; max-width: 400px; margin-top: 20px; }
      .lp-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #71717A;
        margin-top: 24px;
        text-decoration: none;
        transition: color 0.15s;
      }
      .lp-status-pill:hover { color: #A1A1AA; }
      .lp-status-green-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10B981;
      }
      .lp-footer-section-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #52525B;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .lp-footer-newsletter-desc { font-size: 13px; color: #71717A; line-height: 1.5; margin-bottom: 16px; }
      .lp-newsletter-form { display: flex; gap: 8px; }
      .lp-newsletter-input {
        flex: 1;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #27272A;
        background: #15151A;
        color: #E4E4E7;
        font-size: 13px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
      }
      .lp-newsletter-input:focus { border-color: #FF6B00; }
      .lp-newsletter-input::placeholder { color: #52525B; }
      .lp-newsletter-btn {
        padding: 8px 16px;
        border-radius: 6px;
        background: #FF6B00;
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition: opacity 0.2s;
      }
      .lp-newsletter-btn:hover { opacity: 0.9; }
      .lp-footer-links {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 40px;
        margin-bottom: 80px;
      }
      .lp-footer-links ul { list-style: none; padding: 0; margin: 0; }
      .lp-footer-links li { margin-bottom: 12px; }
      .lp-footer-links a {
        font-size: 13px;
        color: #71717A;
        text-decoration: none;
        transition: color 0.15s;
      }
      .lp-footer-links a:hover { color: #E4E4E7; }
      .lp-footer-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 32px;
        border-top: 1px solid #27272A;
        flex-wrap: wrap;
        gap: 20px;
      }
      .lp-footer-legal {
        display: flex;
        align-items: center;
        gap: 24px;
        font-size: 11px;
        color: #3F3F46;
      }
      .lp-footer-social {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .lp-footer-social a { color: #52525B; transition: color 0.15s; }
      .lp-footer-social a:hover { color: #E4E4E7; }
      .lp-footer-wordmark {
        text-align: center;
        font-family: 'Satoshi', sans-serif;
        font-weight: 900;
        font-size: clamp(7rem, 26vw, 24rem);
        line-height: 0.8;
        letter-spacing: -0.05em;
        background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 70%, transparent);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        pointer-events: none;
        user-select: none;
        margin-top: 16px;
        margin-bottom: -3%;
      }

      /* ========== RESPONSIVE ========== */
      @media (max-width: 1024px) {
        .lp-problem-grid { grid-template-columns: 1fr; gap: 48px; }
        .lp-code-grid { grid-template-columns: 1fr; gap: 40px; }
        .lp-principle-grid { grid-template-columns: 80px 1fr; gap: 16px; }
        .lp-principle-desc { grid-column: 2; }
        .lp-enterprise-grid { grid-template-columns: repeat(2, 1fr); }
        .lp-cta-grid { grid-template-columns: 1fr; }
        .lp-cta-left { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .lp-footer-top { grid-template-columns: 1fr; }
        .lp-footer-links { grid-template-columns: repeat(3, 1fr); }
        .lp-metrics-grid { grid-template-columns: repeat(2, 1fr); }
        .lp-console-sidebar { display: none; }
      }

      @media (max-width: 768px) {
        .lp-nav-links { display: none; }
        .lp-nav-links--open {
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(250,250,248,0.98);
          backdrop-filter: blur(12px);
          padding: 16px 24px;
          gap: 16px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .lp-mobile-toggle {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .lp-mobile-toggle span {
          width: 18px;
          height: 2px;
          background: #1A1A1A;
          border-radius: 1px;
          display: block;
        }
        .lp-hero-headline { font-size: clamp(2rem, 8vw, 3rem); }
        .lp-manifesto-headline { font-size: clamp(1.8rem, 7vw, 3rem); }
        .lp-enterprise-grid { grid-template-columns: 1fr; }
        .lp-footer-links { grid-template-columns: repeat(2, 1fr); }
        .lp-principle-grid { grid-template-columns: 1fr; gap: 8px; }
        .lp-principle-num { margin-bottom: -4px; }
      }

      @media (max-width: 375px) {
        .lp-container { padding: 0 16px; }
        .lp-hero { padding: 100px 16px 60px; }
        .lp-hero-ctas { flex-direction: column; }
        .lp-pipeline { flex-wrap: wrap; }
        .lp-nav-actions { gap: 8px; }
        .lp-nav-login { display: none; }
      }

      .lp-hide-mobile { }
      .lp-hide-sm { }
      @media (max-width: 768px) {
        .lp-hide-mobile { display: none !important; }
      }
      @media (max-width: 640px) {
        .lp-hide-sm { display: none !important; }
      }

      /* ========== REDUCED MOTION ========== */
      @media (prefers-reduced-motion: reduce) {
        .lp-root *, .lp-root *::before, .lp-root *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        .lp-reveal { opacity: 1; transform: none; }
        .lp-hero-line { clip-path: inset(0); animation: none; }
        .lp-hero-sub { opacity: 1; transform: none; }
        .lp-pipeline { opacity: 1; }
      }
    `}</style>
  );
}
