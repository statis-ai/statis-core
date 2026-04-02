import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./jsondiffpatch.css";

const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Statis Console",
  description: "Agent execution inspector for the Statis platform.",
  icons: {
    icon: "/favicon-32.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} min-h-screen bg-[#0a0a0a] font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}
