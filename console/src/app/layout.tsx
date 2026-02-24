import type { Metadata } from "next";
import "./globals.css";
import "./jsondiffpatch.css";

export const metadata: Metadata = {
  title: "Statis Console",
  description: "Entity Inspector for the Statis Semantic Event Bus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-brand-statist font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
