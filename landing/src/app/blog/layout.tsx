import { NavbarV2 } from "@/components/sections/NavbarV2";
import { FooterV2 } from "@/components/sections/FooterV2";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarV2 />
      <div className="aurora" aria-hidden="true">
        <div className="aurora__blob aurora__blob--mint" />
        <div className="aurora__blob aurora__blob--violet" />
        <div className="aurora__blob aurora__blob--cyan" />
      </div>
      <div className="noise-overlay" aria-hidden="true" />
      <main className="relative z-10 min-h-screen pt-28 pb-16">
        {children}
      </main>
      <FooterV2 />
    </>
  );
}
