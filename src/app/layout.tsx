import type { Metadata } from "next";
import { Jost, Michroma, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

// Jost — a free geometric sans in the spirit of Futura (the 2001 title typeface).
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

// Michroma — squared "computer readout" face, used for eyebrow labels / wordmark.
const michroma = Michroma({
  variable: "--font-michroma",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ad Astra — A new frontier in Geo targeting",
  description:
    "From one product URL: build your ICP, find where your leads cluster, and fly a drone swarm that paints a QR code in the sky just for them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${michroma.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
