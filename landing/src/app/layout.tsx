import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Statis — The base layer for reliable AI state",
  description:
    "Append-only semantic events → deterministic materialized state → push updates + replay for audit.",
  metadataBase: new URL("https://statis.dev"),
  openGraph: {
    title: "Statis — The base layer for reliable AI state",
    description:
      "Append-only semantic events → deterministic materialized state → push updates + replay for audit.",
    url: "https://statis.dev",
    siteName: "Statis",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Statis" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Statis — The base layer for reliable AI state",
    description:
      "Append-only semantic events → deterministic materialized state → push updates + replay for audit.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-512.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
