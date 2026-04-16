import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { GlobalBackground } from "@/components/ui/GlobalBackground";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Statis — The trust layer for agent runtimes",
  description:
    "The trust layer for agent runtimes. Every context evaluated, every action authorized, every execution receipted.",
  metadataBase: new URL("https://statis.dev"),
  openGraph: {
    title: "Statis — The trust layer for agent runtimes",
    description:
      "The trust layer for agent runtimes. Every context evaluated, every action authorized, every execution receipted.",
    url: "https://statis.dev",
    siteName: "Statis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Statis — The trust layer for agent runtimes",
    description:
      "The trust layer for agent runtimes. Every context evaluated, every action authorized, every execution receipted.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        <GlobalBackground />
        {children}
      </body>
    </html>
  );
}
