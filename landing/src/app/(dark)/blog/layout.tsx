import { TopbarV6, FooterV6 } from "@/components/v6/PageV6Shell";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopbarV6 currentRoute="/blog" />
      <main className="relative z-10 min-h-screen pt-8 pb-16" style={{ background: "var(--bg-body)" }}>
        {children}
      </main>
      <FooterV6 />
    </>
  );
}
