import { TopbarV6, FooterV6 } from "@/components/v6/PageV6Shell";
import "./blog.css";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopbarV6 currentRoute="/blog" />
      <main className="relative z-10 min-h-screen">
        {children}
      </main>
      <FooterV6 />
    </>
  );
}
