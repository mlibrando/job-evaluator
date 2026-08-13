import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Serif, Inter } from "next/font/google";
import { SessionProvider } from "@/components/auth/session-provider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

// Used only for the Fitly wordmark — deliberately a different serif from the
// display face, per the design.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  weight: "500",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fitly",
  description: "See how well your resume fits a job posting, requirement by requirement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${cormorantGaramond.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
