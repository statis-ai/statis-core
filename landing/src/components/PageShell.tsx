import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SectionEyebrow } from "./ui/SectionEyebrow";

export function PageShell({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          {/* Ambient orange glow */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: "20%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "720px",
              height: "360px",
              background:
                "radial-gradient(ellipse at center, rgba(200,92,26,0.09) 0%, transparent 70%)",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-6">
            <div className="mb-6">
              <SectionEyebrow>{eyebrow}</SectionEyebrow>
            </div>
            <h1
              className="font-bold leading-[1.05] tracking-[-0.025em] mb-6"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
            >
              {title}
              {titleAccent && (
                <>
                  {" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #c85c1a 0%, #FB923C 55%, #FED7AA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {titleAccent}
                  </span>
                </>
              )}
            </h1>
            {subtitle && (
              <p
                className="text-base sm:text-lg max-w-2xl leading-relaxed"
                style={{ color: "var(--text-2)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </section>

        {/* Page content */}
        <section className="pb-32">
          <div className="mx-auto max-w-4xl px-6">{children}</div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Shared prose styles for the body of page content
export function PageProse({ children }: { children: ReactNode }) {
  return (
    <div
      className="space-y-6 text-base leading-relaxed"
      style={{ color: "var(--text-2)" }}
    >
      {children}
    </div>
  );
}

export function PageH2({ children }: { children: ReactNode }) {
  return (
    <h2
      className="font-bold tracking-tight text-white mt-12 mb-4"
      style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)" }}
    >
      {children}
    </h2>
  );
}
