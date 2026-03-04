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
  title: "Statis — Agent Execution Infrastructure",
  description:
    "The execution layer for AI agents. Shared state in. Governed, receipted action out.",
  metadataBase: new URL("https://statis.dev"),
  openGraph: {
    title: "Statis — Agent Execution Infrastructure",
    description:
      "The execution layer for AI agents. Shared state in. Governed, receipted action out.",
    url: "https://statis.dev",
    siteName: "Statis",
    images: [{ url: "/og-banner.png", width: 1200, height: 630, alt: "Statis" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Statis — Agent Execution Infrastructure",
    description:
      "The execution layer for AI agents. Shared state in. Governed, receipted action out.",
    images: ["/twitter-card.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
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
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
