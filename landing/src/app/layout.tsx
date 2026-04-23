import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
  title: "Statis — The agent runtime trust layer",
  description:
    "Every context evaluated. Every action authorized. Every execution receipted. Open-source Kit, free Cloud beta, enterprise governance.",
  metadataBase: new URL("https://statis.dev"),
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Statis — The agent runtime trust layer",
    description:
      "Every context evaluated. Every action authorized. Every execution receipted. Open-source Kit, free Cloud beta, enterprise governance.",
    url: "https://statis.dev/",
    siteName: "Statis",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Statis — Every context evaluated. Every action authorized. Every execution receipted.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Statis — The agent runtime trust layer",
    description:
      "Every context evaluated. Every action authorized. Every execution receipted.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
