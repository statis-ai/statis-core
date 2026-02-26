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
      <main className="relative z-10 min-h-screen pt-28 pb-16 bg-gray-50">
        {children}
      </main>
      <FooterV2 />
    </>
  );
}
