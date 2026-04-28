"use client";

import { posts } from "@/data/posts";

const FEATURED_SLUGS = ["gate-decorator-launch", "statis-on-statis"];

export default function BlogHighlights() {
  const featured = FEATURED_SLUGS
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section style={{ padding: "120px 24px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div style={{ maxWidth: 640 }}>
            <div className="eyebrow">
              <span className="ver">§ 10</span>
              <span>From the lab</span>
            </div>
            <h2 className="section-hed">
              What we&rsquo;re writing about{" "}
              <span>while we build it.</span>
            </h2>
          </div>
          <a
            href="/blog"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--ink)",
              textDecoration: "none",
              borderBottom: "1px solid var(--ink)",
              paddingBottom: 3,
            }}
          >
            Read all posts →
          </a>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {featured.map((post) => {
            const href = post.external ?? `/blog/${post.slug}`;
            const external = Boolean(post.external);
            return (
              <a
                key={post.slug}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  padding: 28,
                  background: "var(--paper)",
                  border: "1px solid var(--rule)",
                  borderRadius: 4,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 200ms, transform 200ms",
                }}
                className="blog-highlight-card"
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      padding: "4px 8px",
                      border: "1px solid var(--accent)",
                      borderRadius: 2,
                    }}
                  >
                    {post.tag}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                    {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 400,
                    color: "var(--ink)",
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  {post.title}
                </h3>

                <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-soft)", margin: 0 }}>
                  {post.description}
                </p>

                <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--rule-soft)", display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-muted)" }}>
                  <span>{post.readTime}</span>
                  <span>{external ? "External →" : "Read →"}</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        :global(.blog-highlight-card:hover) {
          border-color: var(--accent) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
