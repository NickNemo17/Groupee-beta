import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

// Score-forward identity: Plex Sans for UI, Plex Mono for scores/prices/numerals.
const plexSans = IBM_Plex_Sans({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Groupee — local, together",
  description:
    "Discover and book genuinely good local experiences — with an AI concierge and your friends.",
};

export const viewport: Viewport = {
  themeColor: "#53a318",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable} antialiased`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
