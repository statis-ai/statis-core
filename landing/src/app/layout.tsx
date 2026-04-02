import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Statis — Agent Execution Infrastructure",
  description:
    "The execution layer for production AI agents. Policy before every action, exactly-once guarantee, SHA-256 receipt.",
  metadataBase: new URL("https://statis.dev"),
  openGraph: {
    title: "Statis — Agent Execution Infrastructure",
    description:
      "The execution layer for production AI agents. Policy before every action, exactly-once guarantee, SHA-256 receipt.",
    url: "https://statis.dev",
    siteName: "Statis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Statis — Agent Execution Infrastructure",
    description:
      "The execution layer for production AI agents. Policy before every action, exactly-once guarantee, SHA-256 receipt.",
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
      <body className={mono.variable}>{children}</body>
    </html>
  );
}
