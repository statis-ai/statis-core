import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Statis — Stop AI Agents from acting on stale data",
  description:
    "The event-driven state layer for multi-agent workflows. Ingest semantic facts once, materialize a single source of truth, and push state changes in real-time.",
  metadataBase: new URL("https://statis.dev"),
  openGraph: {
    title: "Statis — Stop AI Agents from acting on stale data",
    description:
      "The event-driven state layer for multi-agent workflows. Ingest semantic facts once, materialize a single source of truth, and push state changes in real-time.",
    url: "https://statis.dev",
    siteName: "Statis",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Statis" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Statis — Stop AI Agents from acting on stale data",
    description:
      "The event-driven state layer for multi-agent workflows. Push state changes to your AI swarm in real-time.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/new-statis-logo.png",
    apple: "/new-statis-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
