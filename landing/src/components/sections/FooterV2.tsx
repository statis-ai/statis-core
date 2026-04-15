import Link from "next/link";
import { Logo } from "@/components/Logo";

const LINKS = {
  Product: [
    { label: "Console",    href: "https://console.statis.dev",            external: true  },
    { label: "Docs",       href: "https://docs.statis.dev",               external: true  },
    { label: "Primitives", href: "#primitives",                            external: false },
  ],
  Adapters: [
    { label: "Stripe",     href: "https://docs.statis.dev",               external: true  },
    { label: "Salesforce", href: "https://docs.statis.dev",               external: true  },
    { label: "HubSpot",    href: "https://docs.statis.dev",               external: true  },
    { label: "Zendesk",    href: "https://docs.statis.dev",               external: true  },
  ],
  Developers: [
    { label: "GitHub",         href: "https://github.com/statis-ai/statis-sdk", external: true },
    { label: "Python SDK",     href: "https://pypi.org/project/statis-ai/",     external: true },
    { label: "TypeScript SDK", href: "https://www.npmjs.com/package/statis-ai", external: true },
  ],
  Company: [
    { label: "Blog",            href: "/blog",                                        external: false },
    { label: "Enterprise",       href: "https://www.surveymonkey.com/r/GVKH2KR",     external: true  },
  ],
};

export function FooterV2() {
  return (
    <footer style={{ borderTop: "1px solid #2A2218", background: "#1A1207", color: "#D4C8B8", ["--text" as string]: "#D4C8B8", ["--text-2" as string]: "#8B7A66", ["--text-muted" as string]: "#5C4D3D" }}>
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-10 lg:px-8">

        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center cursor-pointer">
              <Logo gapColor="#1A1207" />
            </Link>
            <p className="text-xs leading-relaxed text-[#8B7A66] max-w-[180px]" style={{ fontFamily: "var(--font-sans)" }}>
              Agent execution infrastructure.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--orange)" }} />
              <span className="text-[10px] font-mono" style={{ color: "rgba(184,82,15,0.8)" }}>api.statis.dev live</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5C4D3D] mb-4">
                {group}
              </h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-[#8B7A66] hover:text-[#D4C8B8] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-xs font-mono text-[#8B7A66] hover:text-[#D4C8B8] transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderTop: "1px solid #2A2218" }}
        >
          <p className="text-[10px] font-mono text-[#5C4D3D]">&copy; 2026 Statis Inc.</p>
          <div className="flex gap-5">
            <a href="#" className="text-[10px] font-mono text-[#5C4D3D] hover:text-[#8B7A66] transition-colors">Terms</a>
            <a href="#" className="text-[10px] font-mono text-[#5C4D3D] hover:text-[#8B7A66] transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
