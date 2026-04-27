/**
 * Public-surface route group: bypasses Sidebar + AuthGuard.
 *
 * Wraps `/a/{action_id}` (approval) and `/r/{tenant_id}/{receipt_id}`
 * (receipts). The actual chrome (logo, warning banner, footer) is
 * applied by `<PublicPageChrome>` inside each page so the layout stays
 * minimal and per-page customization is possible without re-wrapping.
 */
export default function ApprovalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-public-surface="true">{children}</div>;
}
