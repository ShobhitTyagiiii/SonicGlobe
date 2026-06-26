import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sonic Globe — Hear the World",
  description:
    "Spin a 3D globe of Earth, click any country, and instantly hear its top music. An interactive atlas of the world's sound.",
  keywords: ["music", "globe", "world", "charts", "Apple Music", "3D", "explore"],
  openGraph: {
    title: "Sonic Globe — Hear the World",
    description:
      "Spin the globe, click a country, hear what the world is listening to.",
    type: "website",
  },
  metadataBase: new URL("https://sonic-globe.vercel.app"),
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
