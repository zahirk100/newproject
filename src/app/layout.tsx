import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://offerteflits.online";
const TITEL = "OfferteFlits: offertes maken met AI voor vakbedrijven";
const BESCHRIJVING =
  "OfferteFlits helpt loodgieters, elektriciens, aannemers en schilders om binnen 1 minuut een professionele offerte te maken met AI. Klanten vragen zelf aan, keuren online goed en de factuur en planning volgen automatisch. Gratis te gebruiken.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITEL,
    template: "%s | OfferteFlits",
  },
  description: BESCHRIJVING,
  keywords: [
    "offerte software",
    "offerte maken",
    "offertes voor vakbedrijven",
    "AI offerte generator",
    "offerte app loodgieter",
    "offerte app elektricien",
    "offerte app aannemer",
    "facturatie software vakman",
    "planning software vakman",
  ],
  authors: [{ name: "OfferteFlits" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: SITE_URL,
    siteName: "OfferteFlits",
    title: TITEL,
    description: BESCHRIJVING,
  },
  twitter: {
    card: "summary_large_image",
    title: TITEL,
    description: BESCHRIJVING,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
