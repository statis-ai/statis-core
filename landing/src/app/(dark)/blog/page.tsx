import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Blog — Statis",
  description:
    "Notes on agent governance, decorator-first design, and what we learn running Statis on Statis.",
};

function ArrowIcon({ external }: { external?: boolean }) {
  if (external) {
    return (
      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    );
  }
  return (
    <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-14 pt-8">
        <p
          className="text-[10px] uppercase tracking-[0.25em] mb-3 inline-block px-2 py-0.5 rounded"
          style={{ color: "var(--text-2)", background: "rgba(255,255,255,0.04)" }}
        >
          Blog
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Writing.
        </h1>
        <p className="mt-3 text-sm max-w-xl" style={{ color: "var(--text-2)" }}>
          Notes on agent governance, decorator-first design, and what we learn running Statis on Statis.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => {
          const isExternal = !!post.external;
          const href = isExternal ? post.external! : `/blog/${post.slug}`;

          const inner = (
            <article
              className="group blog-card flex h-full flex-col justify-between rounded-lg p-6 transition-all duration-200"
            >
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-[9px] uppercase tracking-wider"
                    style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}
                  >
                    {post.tag}
                  </span>
                  <span className="text-[10px]" style={{ color: "#444" }}>
                    {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h2 className="text-base font-bold leading-snug mb-3 transition-colors" style={{ color: "var(--text)" }}>
                  {post.title}
                </h2>

                <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-2)" }}>
                  {post.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between text-[10px]">
                <span style={{ color: "#444" }}>{post.readTime}</span>
                <span
                  className="flex items-center gap-1.5 transition-colors"
                  style={{ color: "#00D4FF" }}
                >
                  {isExternal ? "Read on Medium" : "Read article"}
                  <ArrowIcon external={isExternal} />
                </span>
              </div>
            </article>
          );

          if (isExternal) {
            return (
              <a key={post.slug} href={href} target="_blank" rel="noopener noreferrer" className="block">
                {inner}
              </a>
            );
          }

          return (
            <Link key={post.slug} href={href} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
