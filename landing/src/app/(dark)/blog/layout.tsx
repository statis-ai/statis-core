import { Nav } from "@/components/landing/Nav";
import { LandingFooter } from "@/components/landing/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="relative z-10 min-h-screen pt-32 pb-16" style={{ background: "var(--bg)" }}>
        {children}
      </main>
      <LandingFooter />
    </>
  );
}
