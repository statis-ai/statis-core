/**
 * PublicPageChrome — wrapper for the unauthenticated approval/receipts surface.
 *
 * The console's authenticated app uses Sidebar + AuthGuard. The public approval
 * URL (`/a/{action_id}`) and the receipts URL (`/r/{tenant}/{receipt}`) cannot
 * use those — there is no logged-in user. This component is the shared chrome
 * that wraps both: token-mark header, theme handoff, footer with action_id +
 * countdown slot, and a warning banner about link-bearer authority (D6).
 *
 * Per Q4 in /plan-eng-review delta — extracted now so Lane 3a (approval +
 * decided) and Lane 3b (receipts + graduation) ship behind one chrome and
 * cannot drift visually.
 */
import * as React from "react";
import { StatisMark } from "@/components/StatisMark";

export interface PublicPageChromeProps {
  /** Body content rendered below the header. */
  children: React.ReactNode;
  /** Optional eyebrow line shown above the StatisMark logo (e.g. "approval"). */
  eyebrow?: string;
  /**
   * Footer content — typically the action_id row + expiry countdown. Lane 3a
   * supplies the countdown component (D23). Pass `null` for receipts page,
   * which has its own ROADMAP footer (OV-T3).
   */
  footer?: React.ReactNode;
  /**
   * Show the link-bearer warning banner. Defaults to true on the approval
   * surface, false on receipts (which is read-only). D6 lives here.
   */
  showLinkBearerWarning?: boolean;
}

export function PublicPageChrome({
  children,
  eyebrow,
  footer,
  showLinkBearerWarning = true,
}: PublicPageChromeProps): React.ReactElement {
  return (
    <div className="public-chrome">
      <header className="public-chrome__header">
        <StatisMark />
        {eyebrow ? <span className="public-chrome__eyebrow">{eyebrow}</span> : null}
      </header>

      {showLinkBearerWarning ? (
        <div className="public-chrome__warning" role="status">
          Anyone holding this link can decide this action. Do not forward it.
        </div>
      ) : null}

      <main className="public-chrome__main">{children}</main>

      {footer ? <footer className="public-chrome__footer">{footer}</footer> : null}
    </div>
  );
}
