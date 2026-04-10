import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-32 pb-16" style={{ background: "var(--bg)" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
