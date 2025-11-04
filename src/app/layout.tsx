// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ---------- SEO: Viewport ---------- */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0f1a",
  colorScheme: "dark",
};

/* ---------- SEO Metadata ---------- */
export const metadata: Metadata = {
  metadataBase: new URL("https://qratech.in"),
  title: {
    default: "Qratech — Scan • Connect • Instantly",
    template: "%s | Qratech",
  },
  description:
    "Qratech transforms static QR codes into live, actionable conversations. Scan to call, chat, or trigger workflows — no apps, no numbers. Smart, scalable, and secure.",
  keywords: [
    // Core brand & service
    "Qratech",
    "QR technology",
    "QR communication platform",
    "scan to call",
    "QR calling solution",
    "QR code call system",
    "QR code based helpline",
    "QR voice connect",
    "QR video connect",
    "scan connect instantly",
    "QR powered communication",
    "QR to chat",
    "QR customer engagement",
    // Enterprise / SaaS
    "bulk QR management",
    "enterprise QR system",
    "smart QR analytics",
    "business QR tracking",
    "QR workflow automation",
    "QR CRM integration",
    "QR SaaS India",
    "QR business dashboard",
    "device QR registration",
    // Features & Benefits
    "instant connect QR",
    "no app QR call",
    "QR scan support ticket",
    "QR customer support India",
    "QR code feedback system",
    "scan to order",
    "QR product verification",
    "QR warranty registration",
    "QR complaint management",
    "scan to contact manufacturer",
    // B2B & industry verticals
    "OEM QR integration",
    "automotive QR tag",
    "vehicle QR connect",
    "retail QR connect",
    "industrial QR solution",
    "logistics QR tagging",
    "hospital QR assistance",
    "hotel QR service connect",
    // Marketing & tech
    "AI QR analytics",
    "digital QR innovation",
    "cloud QR platform",
    "QR tech India",
    "QR startup India",
    "Qratech India",
    "Qratech platform",
    "QR based customer engagement system",
  ],
  applicationName: "Qratech",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/images/logo.png", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://qratech.in/",
  },
  openGraph: {
    type: "website",
    url: "https://qratech.in/",
    siteName: "Qratech",
    title: "Qratech — Scan • Connect • Instantly",
    description:
      "Instant conversations via QR. Scan to call or chat. Bulk QR, analytics, and owner control — all in one platform.",
    images: [
      {
        url: "/images/logo.png", // using logo as OG image
        width: 800,
        height: 800,
        alt: "Qratech Logo",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qratech — Scan • Connect • Instantly",
    description:
      "Turn any surface into a conversation. Scan to call/chat. Bulk QR + analytics.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  creator: "Qratech",
  authors: [{ name: "Qratech" }],
  publisher: "Qratech",
};

/* ---------- Root Layout ---------- */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Qratech",
    url: "https://qratech.in/",
    logo: "https://qratech.in/images/logo.png",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-9933309571",
        contactType: "Customer Support",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    ],
  };

  const siteSearchJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://qratech.in/",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://qratech.in/search?q={query}",
      "query-input": "required name=query",
    },
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-[#0b0f1a] text-white">
        {/* Accessibility Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-cyan-500 focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>

        <Header />

        {/* Main Content */}
        <main id="main-content" role="main">
          {children}
        </main>

        <Footer />

        {/* JSON-LD Schema */}
        <Script
          id="ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script
          id="ld-site"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSearchJsonLd) }}
        />
      </body>
    </html>
  );
}
