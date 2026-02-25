import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Blog — Statis",
  description:
    "Thoughts on AI state management, multi-agent coordination, and building reliable autonomous systems.",
};

function ArrowIcon({ external }: { external?: boolean }) {
  if (external) {
    return (
      <svg
        className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 17L17 7M17 7H7M17 7v10"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gradient sm:text-6xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-brand-muted max-w-2xl mx-auto">
          Thoughts on AI state management, multi-agent coordination, and
          building reliable autonomous systems.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map((post) => {
          const isExternal = !!post.external;
          const href = isExternal ? post.external! : `/blog/${post.slug}`;

          const inner = (
            <article className="group glass-card border-glow flex h-full flex-col justify-between rounded-xl p-8 transition-all duration-300 hover:border-brand-accent/20 hover:bg-white/[0.04]">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-medium text-brand-accent">
                    {post.tag}
                  </span>
                  <span className="text-xs text-brand-muted">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-white leading-snug mb-3">
                  {post.title}
                </h2>

                <p className="text-sm leading-relaxed text-brand-muted line-clamp-3">
                  {post.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-brand-muted">
                <span>{post.readTime}</span>
                <span className="flex items-center gap-1.5 text-brand-accent">
                  {isExternal ? "Read on Medium" : "Read more"}
                  <ArrowIcon external={isExternal} />
                </span>
              </div>
            </article>
          );

          if (isExternal) {
            return (
              <a
                key={post.slug}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
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
